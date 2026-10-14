(function () {
    const menu = document.getElementById("menu");
    const content = document.getElementById("content");

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

    function showExercise(exercise) {
        const heading = document.createElement("h2");
        heading.textContent = exercise.title;
        heading.tabIndex = -1;

        const area = document.createElement("p");
        area.textContent = "Område: " + exercise.area;

        content.replaceChildren(heading, area);
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
        details.open = true;

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
