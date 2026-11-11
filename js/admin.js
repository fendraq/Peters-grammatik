(function () {
    "use strict";

    // Teacher area, hidden behind a small hover link in the header.
    // Login: username + password hash from js/admin-config.json.
    // "Lägg till nytt ord" looks the word up in data/lexicon.json.
    // Approved words are collected in a queue (saved in the browser),
    // listed next to the form, and sent to GitHub in one single commit
    // with the Contents API, using a fine-grained personal access token
    // (Contents: Read and write, this repository only).

    var REPO_OWNER = "fendraq";
    var REPO_NAME = "Peters-grammatik";
    var WORD_LIST_PATH = "data/ordforstaelse.json";
    var LEXICON_PATH = "data/lexicon.json";
    var CONFIG_PATH = "js/admin-config.json";
    var PAT_STORAGE_KEY = "github_pat";
    var QUEUE_STORAGE_KEY = "word_queue";

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

    var loggedIn = false;
    var lexiconPromise = null;
    var queue = loadQueue();

    function fetchJson(path) {
        return fetch(path).then(function (response) {
            if (!response.ok) {
                throw new Error(path + ": " + response.status);
            }
            return response.json();
        });
    }

    function loadLexicon() {
        if (!lexiconPromise) {
            lexiconPromise = fetchJson(LEXICON_PATH).catch(function (error) {
                lexiconPromise = null;
                throw error;
            });
        }
        return lexiconPromise;
    }

    function normalizeForm(form) {
        return String(form || "").trim().toLocaleLowerCase("sv");
    }

    function basePos(pos) {
        return String(pos || "").split(/[,\s]/)[0];
    }

    function getPat() {
        try {
            return localStorage.getItem(PAT_STORAGE_KEY) || "";
        } catch (error) {
            return "";
        }
    }

    function savePat(token) {
        try {
            if (token) {
                localStorage.setItem(PAT_STORAGE_KEY, token);
            } else {
                localStorage.removeItem(PAT_STORAGE_KEY);
            }
        } catch (error) {
            // Storage may be unavailable; the token works this session only.
        }
    }

    // ----- Queue of approved words, saved in the browser -----

    function loadQueue() {
        try {
            var raw = localStorage.getItem(QUEUE_STORAGE_KEY);
            var items = raw ? JSON.parse(raw) : [];
            return Array.isArray(items) ? items : [];
        } catch (error) {
            return [];
        }
    }

    function saveQueue() {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (error) {
            // Storage may be unavailable; the queue lives in the page only.
        }
    }

    function queueHasWord(form) {
        var normalized = normalizeForm(form);
        return queue.some(function (entry) {
            return normalizeForm(entry.word) === normalized;
        });
    }

    function removeFromQueue(entries) {
        queue = queue.filter(function (entry) {
            return entries.indexOf(entry) === -1;
        });
        saveQueue();
    }

    function sha256Hex(text) {
        var bytes = new TextEncoder().encode(text);
        return crypto.subtle.digest("SHA-256", bytes).then(function (digest) {
            return Array.prototype.map.call(new Uint8Array(digest), function (byte) {
                return byte.toString(16).padStart(2, "0");
            }).join("");
        });
    }

    function utf8ToBase64(text) {
        var bytes = new TextEncoder().encode(text);
        var binary = "";
        Array.prototype.forEach.call(bytes, function (byte) {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary);
    }

    function createMessage(kind, text) {
        var message = document.createElement("p");
        message.className = "feedback " + kind;
        message.textContent = text;
        return message;
    }

    function createHeading(text) {
        var heading = document.createElement("h2");
        heading.textContent = text;
        return heading;
    }

    function createLabeledField(labelText, input) {
        var label = document.createElement("label");
        label.className = "admin-field";
        var text = document.createElement("span");
        text.textContent = labelText;
        label.append(text, input);
        return label;
    }

    function createTextInput(value) {
        var input = document.createElement("input");
        input.type = "text";
        input.autocapitalize = "none";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.value = value || "";
        return input;
    }

    // ----- Login -----

    function renderLogin(content) {
        content.replaceChildren();
        content.appendChild(createHeading("Lärarinloggning"));

        var userField = document.createElement("input");
        userField.type = "text";
        userField.autocomplete = "username";
        userField.placeholder = "Användarnamn";

        var passwordField = document.createElement("input");
        passwordField.type = "password";
        passwordField.autocomplete = "current-password";
        passwordField.placeholder = "Lösenord";

        var submit = document.createElement("button");
        submit.type = "button";
        submit.textContent = "Logga in";

        var feedback = document.createElement("p");

        submit.addEventListener("click", function () {
            Promise.all([
                fetchJson(CONFIG_PATH),
                sha256Hex(passwordField.value)
            ]).then(function (result) {
                var config = result[0];
                var hash = result[1];
                if (userField.value === config.username && hash === config.passwordHash) {
                    loggedIn = true;
                    renderAdmin(content);
                } else {
                    feedback.className = "feedback wrong";
                    feedback.textContent = "Fel användarnamn eller lösenord.";
                }
            }).catch(function () {
                feedback.className = "feedback wrong";
                feedback.textContent = "Inloggningen kunde inte kontrolleras.";
            });
        });

        content.append(
            createLabeledField("Användarnamn", userField),
            createLabeledField("Lösenord", passwordField),
            submit,
            feedback
        );
        userField.focus();
    }

    // ----- Word lookup -----

    function findExactMatches(lexicon, form) {
        var needle = normalizeForm(form);
        if (!needle) {
            return [];
        }
        return lexicon.filter(function (entry) {
            var forms = [entry.word].concat(entry.idx || []);
            return forms.some(function (candidate) {
                return normalizeForm(candidate) === needle;
            });
        });
    }

    function findPrefixSuggestions(lexicon, form) {
        var needle = normalizeForm(form);
        var suggestions = [];
        var seen = {};
        if (needle.length < 2) {
            return suggestions;
        }
        for (var length = needle.length; length >= 2 && suggestions.length < 5; length--) {
            var prefix = needle.slice(0, length);
            lexicon.forEach(function (entry) {
                if (suggestions.length >= 5) {
                    return;
                }
                var forms = [entry.word].concat(entry.idx || []);
                forms.forEach(function (candidate) {
                    var normalized = normalizeForm(candidate);
                    if (normalized.startsWith(prefix) && !seen[normalized] && !normalized.includes("|")) {
                        seen[normalized] = true;
                        suggestions.push({ form: candidate, entry: entry });
                    }
                });
            });
        }
        return suggestions;
    }

    function findExistingWord(wordList, form) {
        var needle = normalizeForm(form);
        return (wordList.words || []).some(function (entry) {
            return normalizeForm(entry.word) === needle;
        });
    }

    // ----- Admin view -----

    function renderAdmin(content) {
        content.replaceChildren();
        content.appendChild(createHeading("Lägg till nytt ord"));

        var searchField = createTextInput("");
        searchField.placeholder = "Till exempel: kryptera";
        var searchButton = document.createElement("button");
        searchButton.type = "button";
        searchButton.textContent = "Slå upp";

        var resultArea = document.createElement("div");
        resultArea.className = "admin-result";

        function onWordAdded() {
            renderQueue();
            resultArea.replaceChildren(
                createMessage("correct", "Ordet ligger i kön till höger. Lägg till fler ord eller skicka kön till ordlistan.")
            );
            searchField.value = "";
            searchField.focus();
        }

        searchButton.addEventListener("click", function () {
            var form = searchField.value.trim();
            if (!form) {
                resultArea.replaceChildren(createMessage("wrong", "Skriv ett ord först."));
                return;
            }
            resultArea.replaceChildren(createMessage("", "Söker..."));
            Promise.all([
                fetchJson(WORD_LIST_PATH),
                loadLexicon()
            ]).then(function (loaded) {
                var wordList = loaded[0];
                var lexicon = loaded[1];
                if (findExistingWord(wordList, form)) {
                    resultArea.replaceChildren(
                        createMessage("wrong", "Ordet finns redan i ordlistan.")
                    );
                    return;
                }
                if (queueHasWord(form)) {
                    resultArea.replaceChildren(
                        createMessage("wrong", "Ordet ligger redan i kön.")
                    );
                    return;
                }
                var matches = findExactMatches(lexicon, form);
                if (matches.length === 1) {
                    renderWordForm(resultArea, form, matches[0], onWordAdded);
                } else if (matches.length > 1) {
                    renderSenseChoice(resultArea, form, matches, onWordAdded);
                } else {
                    renderSuggestions(resultArea, form, lexicon, onWordAdded);
                }
            }).catch(function () {
                resultArea.replaceChildren(
                    createMessage("wrong", "Ordlistan eller lexikonet kunde inte laddas.")
                );
            });
        });

        var formColumn = document.createElement("div");
        formColumn.append(
            createLabeledField("Ord (grundform)", searchField),
            searchButton,
            resultArea
        );

        var queueColumn = document.createElement("aside");
        queueColumn.className = "admin-queue";
        var queueHeading = document.createElement("h3");
        queueHeading.textContent = "Tillagda ord";
        var queueCount = document.createElement("p");
        queueCount.className = "hint";
        var queueList = document.createElement("div");

        var sendFeedback = document.createElement("p");
        var sendButton = document.createElement("button");
        sendButton.type = "button";
        sendButton.textContent = "Skicka ord till ordlistan";
        sendButton.disabled = true;

        var queueHint = document.createElement("p");
        queueHint.className = "hint";
        queueHint.textContent = "Alla ord i kön skickas i en enda commit. Kön sparas i webbläsaren " +
            "tills du skickar den.";

        function renderQueue() {
            queueList.replaceChildren();
            queueCount.textContent = queue.length === 0
                ? "Inga ord i kön än. Sök ett ord och klicka 'Lägg till ord'."
                : queue.length + (queue.length === 1 ? " ord väntar" : " ord väntar") + " på att skickas.";
            queue.forEach(function (entry, index) {
                var item = document.createElement("div");
                item.className = "admin-queue-item";
                var label = document.createElement("span");
                label.textContent = entry.word + " (" + (POS_LABELS[entry.pos] || entry.pos) + ")";
                var removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.textContent = "Ta bort";
                removeButton.setAttribute("aria-label", "Ta bort ordet " + entry.word);
                removeButton.addEventListener("click", function () {
                    queue.splice(index, 1);
                    saveQueue();
                    renderQueue();
                });
                item.append(label, removeButton);
                queueList.appendChild(item);
            });
            if (!sendButton.dataset.sending) {
                sendButton.disabled = queue.length === 0;
            }
        }

        sendButton.addEventListener("click", function () {
            var pending = queue.slice();
            if (pending.length === 0) {
                return;
            }
            sendButton.dataset.sending = "true";
            sendButton.disabled = true;
            sendFeedback.className = "feedback";
            sendFeedback.textContent = "Skickar " + pending.length + " ord till repot...";
            commitWords(pending).then(function (result) {
                removeFromQueue(result.added.concat(result.skipped));
                sendFeedback.className = "feedback correct";
                var text = result.added.length === 1
                    ? "1 ord tillagt i ordlistan."
                    : result.added.length + " ord tillagda i ordlistan.";
                text += " Det syns på sidan om en liten stund.";
                if (result.skipped.length > 0) {
                    text += " Hoppade över (fanns redan i ordlistan): " +
                        result.skipped.map(function (entry) { return entry.word; }).join(", ") + ".";
                }
                sendFeedback.textContent = text;
            }).catch(function (error) {
                sendFeedback.className = "feedback wrong";
                sendFeedback.textContent = "Kunde inte spara: " + error.message;
            }).then(function () {
                delete sendButton.dataset.sending;
                renderQueue();
            });
        });

        queueColumn.append(
            queueHeading,
            queueCount,
            queueList,
            sendButton,
            sendFeedback,
            queueHint
        );

        var layout = document.createElement("div");
        layout.className = "admin-layout";
        layout.append(formColumn, queueColumn);
        content.appendChild(layout);

        renderQueue();

        var patHeading = document.createElement("h3");
        patHeading.textContent = "GitHub-token";
        var patField = document.createElement("input");
        patField.type = "password";
        patField.placeholder = "GitHub-token (frivillig, sparas i webbläsaren)";
        patField.value = getPat();
        var patSave = document.createElement("button");
        patSave.type = "button";
        patSave.textContent = "Spara token";
        patSave.addEventListener("click", function () {
            savePat(patField.value.trim());
            patField.value = "";
            patFeedback.textContent = "Token sparad.";
        });
        var patFeedback = document.createElement("p");
        var patHint = document.createElement("p");
        patHint.className = "hint";
        patHint.textContent = "Token behövs för att spara ordet i repot. Skapa en fine-grained token " +
            "på github.com (Settings > Developer settings) med behörigheten Contents: Read and write, " +
            "endast för repot " + REPO_OWNER + "/" + REPO_NAME + ".";

        content.append(patHeading, patField, patSave, patFeedback, patHint);
    }

    function renderSenseChoice(area, form, matches, onAdded) {
        area.replaceChildren();
        area.appendChild(createMessage("", "Ordet har flera betydelser. Vilken betydelse avser du?"));
        matches.forEach(function (entry) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "admin-choice";
            var definition = entry.defs[0] || "(ingen förklaring)";
            button.textContent = entry.word + " – " + definition;
            button.addEventListener("click", function () {
                renderWordForm(area, form, entry, onAdded);
            });
            area.appendChild(button);
        });
    }

    function renderSuggestions(area, form, lexicon, onAdded) {
        var suggestions = findPrefixSuggestions(lexicon, form);
        if (suggestions.length === 0) {
            area.replaceChildren();
            renderWordForm(area, form, null, onAdded);
            return;
        }
        area.replaceChildren();
        area.appendChild(createMessage("", "Ordet hittades inte. Menade du något av dessa ord?"));
        suggestions.forEach(function (suggestion) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "admin-choice";
            button.textContent = suggestion.form;
            button.addEventListener("click", function () {
                renderWordForm(area, suggestion.form, suggestion.entry, onAdded);
            });
            area.appendChild(button);
        });
        var manual = document.createElement("button");
        manual.type = "button";
        manual.textContent = "Nej, jag fyller i allt själv";
        manual.addEventListener("click", function () {
            renderWordForm(area, form, null, onAdded);
        });
        area.appendChild(manual);
    }

    function renderWordForm(area, form, entry, onAdded) {
        area.replaceChildren();
        var info = document.createElement("p");
        info.className = "hint";
        if (entry && entry.infl && entry.infl.length > 0) {
            info.textContent = "Böjningsformer i lexikonet: " + entry.infl.join(", ");
        }

        var wordField = createTextInput(form);
        var exampleField = createTextInput(entry && entry.ex && entry.ex.length > 0 ? entry.ex[0] : "");
        var definitionField = createTextInput(entry && entry.defs && entry.defs.length > 0 ? entry.defs[0] : "");
        exampleField.classList.add("wide");
        definitionField.classList.add("wide");

        var posSelect = document.createElement("select");
        var unknownOption = document.createElement("option");
        unknownOption.value = "";
        unknownOption.textContent = "Välj ordklass";
        posSelect.appendChild(unknownOption);
        var entryBase = entry ? basePos(entry.pos) : "";
        Object.keys(POS_LABELS).forEach(function (key) {
            var option = document.createElement("option");
            option.value = key;
            option.textContent = POS_LABELS[key];
            if (key === entryBase) {
                option.selected = true;
            }
            posSelect.appendChild(option);
        });
        if (entryBase && !POS_LABELS[entryBase]) {
            var extra = document.createElement("option");
            extra.value = entryBase;
            extra.textContent = entryBase;
            extra.selected = true;
            posSelect.appendChild(extra);
        }

        function missingHint(text) {
            var hint = document.createElement("p");
            hint.className = "hint";
            hint.textContent = text;
            return hint;
        }

        var exampleMissing = !entry || !entry.ex || entry.ex.length === 0;
        var definitionMissing = !entry || !entry.defs || entry.defs.length === 0;

        var addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "Lägg till ord";
        addButton.disabled = true;

        var addFeedback = document.createElement("p");

        function updateEnabled() {
            addButton.disabled = !(
                wordField.value.trim() &&
                exampleField.value.trim() &&
                definitionField.value.trim() &&
                posSelect.value
            );
        }
        [wordField, exampleField, definitionField].forEach(function (field) {
            field.addEventListener("input", updateEnabled);
        });
        posSelect.addEventListener("change", updateEnabled);
        updateEnabled();

        addButton.addEventListener("click", function () {
            var wordEntry = {
                word: wordField.value.trim(),
                example: exampleField.value.trim(),
                definition: definitionField.value.trim(),
                pos: posSelect.value
            };
            if (queueHasWord(wordEntry.word)) {
                addFeedback.className = "feedback wrong";
                addFeedback.textContent = "Ordet ligger redan i kön.";
                return;
            }
            queue.push(wordEntry);
            saveQueue();
            addFeedback.textContent = "";
            if (onAdded) {
                onAdded(wordEntry);
            }
        });

        if (entry) {
            area.appendChild(info);
        }
        area.append(
            createLabeledField("Ord (grundform)", wordField),
            createLabeledField("Exempelmening", exampleField),
            exampleMissing ? missingHint("Exempelmening saknas i lexikonet. Skriv en själv.") : null,
            createLabeledField("Förklaring", definitionField),
            definitionMissing ? missingHint("Förklaring saknas i lexikonet. Skriv en själv.") : null,
            createLabeledField("Ordklass", posSelect),
            addButton,
            addFeedback
        );
    }

    // ----- Commit to GitHub (one commit for every queued word) -----

    // Adds all entries to data/ordforstaelse.json in a single commit.
    // Entries that already exist in the word list are skipped and
    // reported. Resolves with { added: [...], skipped: [...] }.
    function commitWords(entries) {
        var token = getPat();
        if (!token) {
            return Promise.reject(new Error("Ingen GitHub-token är sparad. Fyll i token nedan."));
        }
        if (entries.length === 0) {
            return Promise.resolve({ added: [], skipped: [] });
        }
        var apiUrl = "https://api.github.com/repos/" + REPO_OWNER + "/" + REPO_NAME +
            "/contents/" + WORD_LIST_PATH + "?ref=main";
        var headers = {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json"
        };

        return fetch(apiUrl, { headers: headers }).then(function (response) {
            if (!response.ok) {
                throw new Error("kunde inte läsa ordlistan (HTTP " + response.status + "). Kontrollera token.");
            }
            return response.json();
        }).then(function (fileInfo) {
            return fetch(fileInfo.download_url).then(function (raw) {
                return raw.json();
            }).then(function (wordList) {
                wordList.words = wordList.words || [];
                var added = [];
                var skipped = [];
                entries.forEach(function (entry) {
                    if (findExistingWord(wordList, entry.word)) {
                        skipped.push(entry);
                    } else {
                        wordList.words.push(entry);
                        added.push(entry);
                    }
                });
                if (added.length === 0) {
                    return { added: added, skipped: skipped };
                }
                var words = added.map(function (entry) { return entry.word; });
                if (words.length > 10) {
                    words = words.slice(0, 10);
                    words.push("+" + (added.length - 10) + " ord till");
                }
                var body = {
                    message: "Add " + added.length + (added.length === 1 ? " word: " : " words: ") + words.join(", "),
                    content: utf8ToBase64(JSON.stringify(wordList, null, 2)),
                    sha: fileInfo.sha,
                    branch: "main"
                };
                return fetch(apiUrl, {
                    method: "PUT",
                    headers: headers,
                    body: JSON.stringify(body)
                }).then(function (response) {
                    if (response.ok) {
                        return { added: added, skipped: skipped };
                    }
                    return response.json().then(function (error) {
                        throw new Error(error.message || ("HTTP " + response.status));
                    });
                });
            });
        });
    }

    // ----- Hidden door in the header -----

    function mountDoor() {
        var header = document.querySelector("header");
        if (!header) {
            return;
        }
        var door = document.createElement("button");
        door.type = "button";
        door.className = "admin-door";
        door.textContent = "Admin";
        door.addEventListener("click", function () {
            var content = document.getElementById("content");
            if (!content) {
                return;
            }
            if (loggedIn) {
                renderAdmin(content);
            } else {
                renderLogin(content);
            }
        });
        header.appendChild(door);
    }

    mountDoor();
})();
