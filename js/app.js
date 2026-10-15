(function () {
    const menu = document.getElementById("menu");
    const content = document.getElementById("content");
    let stopGame = null;

    async function fetchJson(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(path + ": " + response.status);
        }
        return response.json();
    }

    async function loadExercises() {
        const index = await fetchJson("data/index.json");
        const results = await Promise.allSettled(
            index.files.map(function (file) {
                return fetchJson("data/" + file);
            })
        );
        return {
            exercises: results
                .filter(function (result) { return result.status === "fulfilled"; })
                .map(function (result) { return result.value; }),
            failedCount: results.filter(function (result) { return result.status === "rejected"; }).length
        };
    }

    function groupByArea(exercises) {
        const groups = new Map();
        exercises.forEach(function (exercise) {
            if (!groups.has(exercise.area)) {
                groups.set(exercise.area, []);
            }
            groups.get(exercise.area).push(exercise);
        });
        return groups;
    }

    function createRules(rules) {
        const details = document.createElement("details");
        details.className = "rules";

        const summary = document.createElement("summary");
        summary.textContent = "Grammatiska regler";

        const list = document.createElement("ul");
        rules.forEach(function (rule) {
            const item = document.createElement("li");
            item.textContent = rule;
            list.appendChild(item);
        });

        details.append(summary, list);
        return details;
    }

    function normalizeText(text) {
        return text.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("sv");
    }

    function matchesText(value, answers) {
        const normalized = normalizeText(value);
        return normalized !== "" && answers.some(function (answer) {
            return normalizeText(answer) === normalized;
        });
    }

    function createTextInput(labelText) {
        const label = document.createElement("label");
        const hidden = document.createElement("span");
        hidden.className = "visually-hidden";
        hidden.textContent = labelText;

        const input = document.createElement("input");
        input.type = "text";
        input.autocomplete = "off";
        input.autocapitalize = "none";
        input.spellcheck = false;

        label.append(hidden, input);
        return { label: label, input: input };
    }

    function createGapFillTask(exercise, number) {
        const parts = exercise.text.split("____");
        const field = createTextInput("Svar till uppgift " + number);

        const sentence = document.createElement("p");
        sentence.append(parts[0], field.label, parts.slice(1).join(""));

        return {
            element: sentence,
            getValue: function () { return field.input.value; },
            isCorrect: function (value) { return matchesText(value, exercise.answers); },
            emptyMessage: "Skriv ett svar först."
        };
    }

    function createMultipleChoiceTask(exercise, number) {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = exercise.question;
        fieldset.appendChild(legend);

        exercise.options.forEach(function (option) {
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "task-" + number;
            radio.value = option;
            label.append(radio, " " + option);
            fieldset.appendChild(label);
        });

        return {
            element: fieldset,
            getValue: function () {
                const checked = fieldset.querySelector("input:checked");
                return checked ? checked.value : "";
            },
            isCorrect: function (value) { return value !== "" && exercise.answers.includes(value); },
            emptyMessage: "Välj ett svar först."
        };
    }

    function createContextAnswerTask(exercise, number) {
        const wrapper = document.createElement("div");

        const context = document.createElement("blockquote");
        context.textContent = exercise.context;

        const question = document.createElement("p");
        question.textContent = exercise.question;

        const field = createTextInput("Svar till uppgift " + number);
        wrapper.append(context, question, field.label);

        return {
            element: wrapper,
            getValue: function () { return field.input.value; },
            isCorrect: function (value) { return matchesText(value, exercise.answers); },
            emptyMessage: "Skriv ett svar först."
        };
    }

    function createSelectWordsTask(exercise, number, onChange) {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = exercise.question;

        const words = document.createElement("div");
        words.className = "words";

        const correctPositions = new Set(exercise.answers);

        function isPressed(button) {
            return button.getAttribute("aria-pressed") === "true";
        }

        function clearState(button) {
            delete button.dataset.state;
            const status = button.querySelector(".status");
            if (status) {
                status.remove();
            }
        }

        function showState(button, state, label) {
            clearState(button);
            button.dataset.state = state;
            const status = document.createElement("span");
            status.className = "status";
            status.textContent = " " + label;
            button.appendChild(status);
        }

        const buttons = exercise.words.map(function (word) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "word";
            button.textContent = word;
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", function () {
                button.setAttribute("aria-pressed", String(!isPressed(button)));
                clearState(button);
                onChange();
            });
            return button;
        });
        words.append(...buttons);
        fieldset.append(legend, words);

        return {
            element: fieldset,
            check: function () {
                let found = 0;
                let extra = 0;
                buttons.forEach(function (button, position) {
                    const shouldBePressed = correctPositions.has(position);
                    if (isPressed(button) && shouldBePressed) {
                        found++;
                        showState(button, "correct", "✓ rätt");
                    } else if (isPressed(button)) {
                        extra++;
                        showState(button, "wrong", "✗ fel");
                    } else if (shouldBePressed) {
                        showState(button, "missed", "saknas");
                    } else {
                        clearState(button);
                    }
                });
                return {
                    correct: found === correctPositions.size && extra === 0,
                    found: found,
                    total: correctPositions.size,
                    extra: extra
                };
            },
            reset: function () {
                buttons.forEach(function (button) {
                    button.setAttribute("aria-pressed", "false");
                    clearState(button);
                });
            }
        };
    }

    const taskCreators = {
        "gap-fill": createGapFillTask,
        "multiple-choice": createMultipleChoiceTask,
        "context-answer": createContextAnswerTask,
        "select-words": createSelectWordsTask
    };

    function createTaskItem(exercise, number) {
        const creator = taskCreators[exercise.type];
        if (!creator) {
            return null;
        }
        const feedback = document.createElement("p");
        feedback.className = "feedback";
        const task = creator(exercise, number, function () { setFeedback(feedback, "", ""); });

        const item = document.createElement("li");
        item.append(task.element, feedback);

        return { item: item, task: task, feedback: feedback, answers: exercise.answers };
    }

    function setFeedback(feedback, kind, text) {
        feedback.className = "feedback " + kind;
        feedback.textContent = text;
    }

    function checkTask(entry) {
        if (entry.task.check) {
            const result = entry.task.check();
            if (result.correct) {
                setFeedback(entry.feedback, "correct", "✅ Rätt!");
            } else {
                setFeedback(entry.feedback, "wrong", "❌ Inte riktigt. Försök igen.");
            }
            return result;
        }
        const value = entry.task.getValue();
        if (normalizeText(value) === "") {
            setFeedback(entry.feedback, "wrong", "❌ " + entry.task.emptyMessage);
            return { correct: false };
        }
        if (entry.task.isCorrect(value)) {
            setFeedback(entry.feedback, "correct", "✅ Rätt!");
            return { correct: true };
        }
        setFeedback(entry.feedback, "wrong",
            "❌ Inte riktigt. Försök igen. Rätt svar: " + entry.answers.join(" eller "));
        return { correct: false };
    }

    function createSummaryText(correctCount, total) {
        const result = "Du fick " + correctCount + " av " + total + " rätt. ";
        if (correctCount === total) {
            return result + "Fantastiskt, du hade allt rätt!";
        }
        if (correctCount * 2 >= total) {
            return result + "Bra jobbat! Titta på de som blev fel och försök igen.";
        }
        return result + "Bra försök! Läs reglerna och försök igen.";
    }

    function createWordSummaryText(found, total, extra) {
        let result = "Du hittade " + found + " av " + total + " rätta. ";
        if (extra > 0) {
            result += extra + " markeringar blev fel. ";
        }
        if (found === total && extra === 0) {
            return result + "Fantastiskt, du hade allt rätt!";
        }
        if (found * 2 >= total) {
            return result + "Bra jobbat! Titta på de gula och röda orden och försök igen.";
        }
        return result + "Bra försök! Läs reglerna och försök igen.";
    }

    function createSummary(results) {
        const wordResults = results.filter(function (result) { return result.total !== undefined; });
        const otherResults = results.filter(function (result) { return result.total === undefined; });
        const parts = [];
        if (otherResults.length > 0) {
            const correctCount = otherResults.filter(function (result) { return result.correct; }).length;
            parts.push(createSummaryText(correctCount, otherResults.length));
        }
        if (wordResults.length > 0) {
            const sum = function (key) {
                return wordResults.reduce(function (total, result) { return total + result[key]; }, 0);
            };
            parts.push(createWordSummaryText(sum("found"), sum("total"), sum("extra")));
        }
        return parts.join(" ");
    }

    function createWordLegend() {
        const legend = document.createElement("p");
        legend.className = "word-legend";
        legend.textContent = "Klicka på orden och tryck på Rätta. " +
            "Grön ✓ = rätt. Röd ✗ = fel ord. Gul med streckad ram = saknas (du missade den).";
        return legend;
    }

    function createExerciseForm(exercises) {
        const form = document.createElement("form");
        form.noValidate = true;

        const list = document.createElement("ol");
        list.className = "tasks";
        const entries = exercises
            .map(function (exercise, index) { return createTaskItem(exercise, index + 1); })
            .filter(function (entry) { return entry !== null; });
        entries.forEach(function (entry) { list.appendChild(entry.item); });
        const hasWordTasks = exercises.some(function (exercise) { return exercise.type === "select-words"; });

        const checkButton = document.createElement("button");
        checkButton.type = "submit";
        checkButton.textContent = "Rätta";

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.textContent = "Börja om";

        const summary = document.createElement("p");
        summary.className = "summary";
        summary.setAttribute("role", "status");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            summary.textContent = createSummary(entries.map(checkTask));
        });

        resetButton.addEventListener("click", function () {
            form.reset();
            entries.forEach(function (entry) {
                if (entry.task.reset) {
                    entry.task.reset();
                }
                setFeedback(entry.feedback, "", "");
            });
            summary.textContent = "";
        });

        if (hasWordTasks) {
            form.appendChild(createWordLegend());
        }
        form.append(list, checkButton, resetButton, summary);
        return form;
    }

    function stopActiveGame() {
        if (stopGame) {
            stopGame();
            stopGame = null;
        }
    }

    function showGame(game) {
        if (!window.WhackWords) {
            content.appendChild(createMessage("Spelet kunde inte laddas. Försök igen senare."));
            return;
        }
        stopGame = window.WhackWords.mount(content, game);
    }

    function showExercise(exercise) {
        stopActiveGame();
        const heading = document.createElement("h2");
        heading.textContent = exercise.title;
        heading.tabIndex = -1;

        const area = document.createElement("p");
        area.textContent = "Område: " + exercise.area;

        content.replaceChildren(heading, area);
        if (exercise.rules && exercise.rules.length > 0) {
            content.appendChild(createRules(exercise.rules));
        }
        const game = exercise.exercises.find(function (task) { return task.type === "whack-words"; });
        if (game) {
            showGame(game);
        } else {
            content.appendChild(createExerciseForm(exercise.exercises));
        }
        heading.focus();
    }

    function markSelected(button) {
        menu.querySelectorAll("button[aria-current]").forEach(function (other) {
            other.removeAttribute("aria-current");
        });
        button.setAttribute("aria-current", "true");
    }

    function createExerciseItem(exercise) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = exercise.title;
        button.addEventListener("click", function () {
            markSelected(button);
            showExercise(exercise);
        });
        item.appendChild(button);
        return item;
    }

    function createAreaSection(areaName, exercises) {
        const details = document.createElement("details");

        const summary = document.createElement("summary");
        summary.textContent = areaName;

        const list = document.createElement("ul");
        exercises.forEach(function (exercise) {
            list.appendChild(createExerciseItem(exercise));
        });

        details.append(summary, list);
        return details;
    }

    function createMessage(text) {
        const message = document.createElement("p");
        message.textContent = text;
        return message;
    }

    function renderMenu(groups, failedCount) {
        const heading = document.createElement("h2");
        heading.textContent = "Områden";
        menu.replaceChildren(heading);

        if (groups.size === 0) {
            menu.appendChild(createMessage("Det finns inga övningar än."));
        }
        groups.forEach(function (exercises, areaName) {
            menu.appendChild(createAreaSection(areaName, exercises));
        });
        if (failedCount > 0) {
            menu.appendChild(createMessage("Några övningar kunde inte laddas."));
        }
    }

    async function init() {
        try {
            const loaded = await loadExercises();
            renderMenu(groupByArea(loaded.exercises), loaded.failedCount);
        } catch (error) {
            menu.replaceChildren(createMessage("Övningarna kunde inte laddas. Försök igen senare."));
        }
    }

    init();
})();
