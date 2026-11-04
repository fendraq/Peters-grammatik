(function () {
    "use strict";

    // Teacher area, hidden behind a small hover link in the header.
    // Login: username + password hash from js/admin-config.json.
    // "Lägg till nytt ord" looks the word up in data/lexicon.json
    // and commits the updated word list to GitHub with the
    // Contents API, using a fine-grained personal access token
    // (Contents: Read and write, this repository only).

    var REPO_OWNER = "fendraq";
    var REPO_NAME = "Peters-grammatik";
    var WORD_LIST_PATH = "data/ordforstaelse.json";
    var LEXICON_PATH = "data/lexicon.json";
    var CONFIG_PATH = "js/admin-config.json";
    var PAT_STORAGE_KEY = "github_pat";

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
                var matches = findExactMatches(lexicon, form);
                if (matches.length === 1) {
                    renderWordForm(resultArea, form, matches[0]);
                } else if (matches.length > 1) {
                    renderSenseChoice(resultArea, form, matches);
                } else {
                    renderSuggestions(resultArea, form, lexicon);
                }
            }).catch(function () {
                resultArea.replaceChildren(
                    createMessage("wrong", "Ordlistan eller lexikonet kunde inte laddas.")
                );
            });
        });

        content.append(
            createLabeledField("Ord (grundform)", searchField),
            searchButton,
            resultArea
        );

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

    function renderSenseChoice(area, form, matches) {
        area.replaceChildren();
        area.appendChild(createMessage("", "Ordet har flera betydelser. Vilken betydelse avser du?"));
        matches.forEach(function (entry) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "admin-choice";
            var definition = entry.defs[0] || "(ingen förklaring)";
            button.textContent = entry.word + " – " + definition;
            button.addEventListener("click", function () {
                renderWordForm(area, form, entry);
            });
            area.appendChild(button);
        });
    }

    function renderSuggestions(area, form, lexicon) {
        var suggestions = findPrefixSuggestions(lexicon, form);
        if (suggestions.length === 0) {
            area.replaceChildren();
            renderWordForm(area, form, null);
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
                renderWordForm(area, suggestion.form, suggestion.entry);
            });
            area.appendChild(button);
        });
        var manual = document.createElement("button");
        manual.type = "button";
        manual.textContent = "Nej, jag fyller i allt själv";
        manual.addEventListener("click", function () {
            renderWordForm(area, form, null);
        });
        area.appendChild(manual);
    }

    function renderWordForm(area, form, entry) {
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
        addButton.textContent = "Lägg till ord i ordlistan";
        addButton.disabled = true;

        var commitFeedback = document.createElement("p");

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
            addButton.disabled = true;
            commitFeedback.className = "feedback";
            commitFeedback.textContent = "Sparar ordet i repot...";
            commitWord({
                word: wordField.value.trim(),
                example: exampleField.value.trim(),
                definition: definitionField.value.trim(),
                pos: posSelect.value
            }).then(function () {
                commitFeedback.className = "feedback correct";
                commitFeedback.textContent = "Ordet tillagt i ordlistan. Det syns på sidan om en liten stund.";
            }).catch(function (error) {
                addButton.disabled = false;
                commitFeedback.className = "feedback wrong";
                commitFeedback.textContent = "Kunde inte spara: " + error.message;
            });
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
            commitFeedback
        );
    }

    // ----- Commit to GitHub -----

    function commitWord(wordEntry) {
        var token = getPat();
        if (!token) {
            return Promise.reject(new Error("Ingen GitHub-token är sparad. Fyll i en token ovan."));
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
                wordList.words.push(wordEntry);
                var body = {
                    message: "Add word: " + wordEntry.word,
                    content: utf8ToBase64(JSON.stringify(wordList, null, 2)),
                    sha: fileInfo.sha,
                    branch: "main"
                };
                return fetch(apiUrl, {
                    method: "PUT",
                    headers: headers,
                    body: JSON.stringify(body)
                });
            });
        }).then(function (response) {
            if (response.ok) {
                return null;
            }
            return response.json().then(function (error) {
                throw new Error(error.message || ("HTTP " + response.status));
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
