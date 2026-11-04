(function () {
    "use strict";

    // Exercise type "word-comprehension": one word per session.
    // "Veckans ord" (daily word) is deterministic from the date,
    // "Öva ordförståelse" (practice) picks a random word the student
    // has not done yet. Wrong options (definitions and word classes)
    // are picked fresh from data/lexicon.json on every render.

    var STORAGE_KEY = "word_exercise_done_v1";
    var DAILY_EPOCH_MS = Date.UTC(2026, 10, 4); // launch date, 2026-11-04
    var MS_PER_DAY = 24 * 60 * 60 * 1000;

    var POS_LABELS = {
        "subst.": "substantiv",
        "verb": "verb",
        "adj.": "adjektiv",
        "adv.": "adverb",
        "prep.": "preposition",
        "pron.": "pronomen",
        "konj.": "konjunktion",
        "interj.": "interjektion",
        "räkn.": "räkneord",
        "förk.": "förkortning",
        "namn": "namn"
    };

    var lexiconPromise = null;
    var wordListPromise = null;

    function fetchJson(path, options) {
        return fetch(path, options || {}).then(function (response) {
            if (!response.ok) {
                throw new Error(path + ": " + response.status);
            }
            return response.json();
        });
    }

    function loadLexicon() {
        if (!lexiconPromise) {
            lexiconPromise = fetchJson("data/lexicon.json").catch(function (error) {
                lexiconPromise = null;
                throw error;
            });
        }
        return lexiconPromise;
    }

    function loadWordList() {
        if (!wordListPromise) {
            // The word list is small and changes when the teacher adds words,
            // so always revalidate it instead of trusting the browser cache.
            wordListPromise = fetchJson("data/ordforstaelse.json", { cache: "no-cache" });
        }
        return wordListPromise;
    }

    // "adj., ingen böjning" and "subst. plural" -> "adj." / "subst."
    function basePos(pos) {
        return String(pos || "").split(/[,\s]/)[0];
    }

    function posLabel(pos) {
        var base = basePos(pos);
        return POS_LABELS[base] || base;
    }

    function shuffle(list) {
        var copy = list.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    // Three definitions from other words of the same word class.
    // Returns null if the lexicon is unavailable or too small.
    function buildDefinitionOptions(wordEntry, lexicon) {
        var base = basePos(wordEntry.pos);
        var pool = lexicon.filter(function (entry) {
            if (basePos(entry.pos) !== base) {
                return false;
            }
            if (!entry.defs || entry.defs.length === 0) {
                return false;
            }
            return entry.word !== wordEntry.word;
        });
        if (pool.length < 3) {
            return null;
        }
        var options = [wordEntry.definition];
        var seen = {};
        seen[wordEntry.definition] = true;
        shuffle(pool).forEach(function (entry) {
            if (options.length >= 4) {
                return;
            }
            var definition = entry.defs[0];
            if (!definition || seen[definition]) {
                return;
            }
            seen[definition] = true;
            options.push(definition);
        });
        return options.length >= 4 ? shuffle(options) : null;
    }

    function buildPosOptions(wordEntry) {
        var correct = posLabel(wordEntry.pos);
        var others = Object.keys(POS_LABELS).map(function (key) {
            return POS_LABELS[key];
        }).filter(function (label) {
            return label !== correct;
        });
        return shuffle([correct].concat(shuffle(others).slice(0, 3)));
    }

    function getDoneWords() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    }

    function saveDoneWords(words) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
        } catch (error) {
            // Storage may be unavailable (private mode); the exercise still works.
        }
    }

    function pickPracticeWord(words) {
        var done = getDoneWords();
        var available = words.filter(function (entry) {
            return done.indexOf(entry.word) === -1;
        });
        var startOver = false;
        if (available.length === 0) {
            // All words done: start over so the student can repeat them.
            available = words;
            startOver = true;
        }
        return {
            entry: available[Math.floor(Math.random() * available.length)],
            startOver: startOver
        };
    }

    function pickDailyWord(words) {
        var day = Math.floor((Date.now() - DAILY_EPOCH_MS) / MS_PER_DAY);
        var index = ((day % words.length) + words.length) % words.length;
        return words[index];
    }

    function createOptionGroup(name, question, options) {
        var fieldset = document.createElement("fieldset");
        fieldset.className = "word-options";
        var legend = document.createElement("legend");
        legend.textContent = question;
        fieldset.appendChild(legend);

        options.forEach(function (option) {
            var label = document.createElement("label");
            var radio = document.createElement("input");
            radio.type = "radio";
            radio.name = name;
            radio.value = option;
            label.append(radio, " " + option);
            fieldset.appendChild(label);
        });
        return fieldset;
    }

    function getSelectedValue(group) {
        var checked = group.querySelector("input:checked");
        return checked ? checked.value : "";
    }

    function setFeedback(element, kind, text) {
        element.className = "feedback " + kind;
        element.textContent = text;
    }

    function isWordCharacter(character) {
        return character !== "" && /[0-9A-Za-zÀ-ÿ]/.test(character);
    }

    // Find "form" in "sentence" as a whole word, not inside a longer word.
    // Returns the index of the first match, or -1.
    function findWholeWord(sentence, form) {
        var lower = sentence.toLocaleLowerCase("sv");
        var target = form.toLocaleLowerCase("sv");
        var index = lower.indexOf(target);
        while (index !== -1) {
            var before = index === 0 ? "" : sentence.charAt(index - 1);
            var after = index + target.length >= sentence.length ? "" : sentence.charAt(index + target.length);
            if (!isWordCharacter(before) && !isWordCharacter(after)) {
                return index;
            }
            index = lower.indexOf(target, index + 1);
        }
        return -1;
    }

    // All known word forms of the exercise word (base form, inflections and
    // index forms from the lexicon), so "kryptera" also matches
    // "krypterade" in an example sentence.
    function collectWordForms(entry, lexicon) {
        var forms = [entry.word];
        var add = function (form) {
            if (form && form.length >= 3 && !/[:\s]/.test(form) && forms.indexOf(form) === -1) {
                forms.push(form);
            }
        };
        lexicon.forEach(function (lexEntry) {
            var isMatch = lexEntry.word === entry.word ||
                (lexEntry.idx && lexEntry.idx.indexOf(entry.word) !== -1);
            if (isMatch) {
                (lexEntry.infl || []).forEach(add);
                (lexEntry.idx || []).forEach(add);
            }
        });
        // Longest form first: "krypterade" should win over "kryptera".
        forms.sort(function (a, b) { return b.length - a.length; });
        return forms;
    }

    // Build the example sentence with the exercise word in italics,
    // so the student can tell it apart from the rest of the sentence.
    function appendExampleSentence(container, entry, lexicon) {
        var sentence = String(entry.example || "");
        var marked = null;
        if (lexicon) {
            var forms = collectWordForms(entry, lexicon);
            for (var i = 0; i < forms.length; i++) {
                var index = findWholeWord(sentence, forms[i]);
                if (index !== -1) {
                    marked = { start: index, length: forms[i].length };
                    break;
                }
            }
        }
        if (!marked) {
            container.appendChild(document.createTextNode(sentence));
            return;
        }
        var em = document.createElement("em");
        em.textContent = sentence.slice(marked.start, marked.start + marked.length);
        container.append(
            document.createTextNode(sentence.slice(0, marked.start)),
            em,
            document.createTextNode(sentence.slice(marked.start + marked.length))
        );
    }

    function createWordCard(container, entry, lexicon, options) {
        var card = document.createElement("section");
        card.className = "word-card";

        var headline = document.createElement("h3");
        headline.className = "word-headline";
        headline.textContent = "Ord: " + entry.word;
        card.appendChild(headline);

        var example = document.createElement("blockquote");
        appendExampleSentence(example, entry, lexicon);
        card.appendChild(example);

        var definitionOptions = lexicon ? buildDefinitionOptions(entry, lexicon) : null;
        var definitionGroup = null;
        var definitionFeedback = document.createElement("p");

        if (definitionOptions) {
            definitionGroup = createOptionGroup(
                "definition",
                "Välj förklaringen som passar \u201C" + entry.word + "\u201D:",
                definitionOptions
            );
            card.append(definitionGroup, definitionFeedback);
        } else {
            var note = document.createElement("p");
            note.className = "hint";
            note.textContent = "Ordförklaringarna kunde inte laddas. Du kan ändå svara på frågan om ordklassen.";
            card.appendChild(note);
        }

        var posOptions = buildPosOptions(entry);
        var posGroup = createOptionGroup(
            "pos",
            "Välj vilken ordklass som \u201C" + entry.word + "\u201D tillhör:",
            posOptions
        );
        var posFeedback = document.createElement("p");
        card.append(posGroup, posFeedback);

        var summary = document.createElement("p");
        summary.className = "summary";
        summary.setAttribute("role", "status");

        var checkButton = document.createElement("button");
        checkButton.type = "button";
        checkButton.textContent = "Rätta";

        var nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "Nästa ord";
        nextButton.hidden = true;

        function isChecked() {
            var problems = [];
            if (definitionGroup && getSelectedValue(definitionGroup) === "") {
                problems.push("Välj en förklaring först.");
            }
            if (getSelectedValue(posGroup) === "") {
                problems.push("Välj en ordklass först.");
            }
            return problems;
        }

        checkButton.addEventListener("click", function () {
            var problems = isChecked();
            if (problems.length > 0) {
                setFeedback(summary, "wrong", "❌ " + problems.join(" "));
                return;
            }
            var correct = true;

            if (definitionGroup) {
                var definition = getSelectedValue(definitionGroup);
                if (definition === entry.definition) {
                    setFeedback(definitionFeedback, "correct", "✅ Rätt!");
                } else {
                    correct = false;
                    setFeedback(definitionFeedback, "wrong",
                        "❌ Inte riktigt. Försök igen. Rätt svar: " + entry.definition);
                }
            }

            var pos = getSelectedValue(posGroup);
            if (pos === posLabel(entry.pos)) {
                setFeedback(posFeedback, "correct", "✅ Rätt!");
            } else {
                correct = false;
                setFeedback(posFeedback, "wrong",
                    "❌ Inte riktigt. Försök igen. Rätt svar: " + posLabel(entry.pos));
            }

            if (correct) {
                setFeedback(summary, "correct", "Bra jobbat! Ordet är avklarat.");
                if (options && options.onCompleted) {
                    options.onCompleted(entry);
                }
                if (options && options.showNext) {
                    nextButton.hidden = false;
                }
            }
        });

        if (options && options.showNext) {
            nextButton.addEventListener("click", function () {
                if (options.onNext) {
                    options.onNext();
                }
            });
        }

        card.append(checkButton, nextButton, summary);
        container.appendChild(card);
    }

    function createMessage(text) {
        var message = document.createElement("p");
        message.textContent = text;
        return message;
    }

    function emptyListMessage(container) {
        container.appendChild(createMessage(
            "Ordlistan är tom. Läraren har inte lagt till några ord än."
        ));
    }

    function mountWordView(container, entry, lexicon, options) {
        container.replaceChildren(createMessage("Laddar ordet..."));
        container.replaceChildren();
        if (options && options.startOver) {
            container.appendChild(createMessage(
                "Du har gjort alla ord! Nu börjar listan om så att du kan träna igen."
            ));
        }
        createWordCard(container, entry, lexicon, options);
    }

    function mountDaily(container) {
        loadWordList().then(function (list) {
            var words = list.words || [];
            if (words.length === 0) {
                container.replaceChildren();
                emptyListMessage(container);
                return;
            }
            loadLexicon().catch(function () { return null; }).then(function (lexicon) {
                container.replaceChildren();
                var heading = document.createElement("h2");
                heading.textContent = "Veckans ord";
                container.appendChild(heading);
                var intro = createMessage(
                    "Ett nytt ord varje dag. Läs meningen och svara på de två frågorna."
                );
                container.appendChild(intro);
                createWordCard(container, pickDailyWord(words), lexicon, null);
            });
        }).catch(function () {
            container.replaceChildren(createMessage("Ordet kunde inte laddas. Försök igen senare."));
        });
    }

    function mountPractice(container) {
        loadWordList().then(function (list) {
            var words = list.words || [];
            if (words.length === 0) {
                container.replaceChildren();
                var heading = document.createElement("h2");
                heading.textContent = "Öva ordförståelse";
                container.appendChild(heading);
                emptyListMessage(container);
                return;
            }
            loadLexicon().catch(function () { return null; }).then(function (lexicon) {
                var pick = pickPracticeWord(words);
                container.replaceChildren();
                var heading = document.createElement("h2");
                heading.textContent = "Öva ordförståelse";
                container.appendChild(heading);

                if (pick.startOver) {
                    container.appendChild(createMessage(
                        "Du har gjort alla ord! Nu börjar listan om så att du kan träna igen."
                    ));
                }

                var options = {
                    showNext: true,
                    startOver: pick.startOver,
                    onCompleted: function (entry) {
                        var done = getDoneWords();
                        if (done.indexOf(entry.word) === -1) {
                            done.push(entry.word);
                            saveDoneWords(done);
                        }
                    },
                    onNext: function () {
                        mountPractice(container);
                    }
                };
                createWordCard(container, pick.entry, lexicon, options);
            });
        }).catch(function () {
            container.replaceChildren(createMessage("Ordet kunde inte laddas. Försök igen senare."));
        });
    }

    window.WordExercise = {
        mountDaily: mountDaily,
        mountPractice: mountPractice
    };
})();
