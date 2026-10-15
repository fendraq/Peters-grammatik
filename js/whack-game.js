(function () {
    const RULES = {
        winHits: 20,
        maxFails: 10,
        hitPoints: 10,
        wrongPoints: -10,
        maxVisible: 4,
        startVisibleMs: 3000,
        minVisibleMs: 1000,
        speedUpMsPerHit: 100,
        startSpawnMs: 1500,
        minSpawnMs: 500,
        spawnSpeedUpMsPerHit: 50,
        firstSpawnMs: 600,
        retrySpawnMs: 200,
        targetChance: 0.5,
        currentLevelChance: 0.6,
        levelStepHits: 7,
        maxLevel: 3,
        recentMemory: 4,
        placementAttempts: 25,
        wordGap: 8,
        maxFrameMs: 100,
        effectMs: 700,
        touchHammerMs: 450
    };

    const logic = {
        createState: function () {
            return { score: 0, hits: 0, fails: 0, hitWords: [], missedWords: [], wrongWords: [] };
        },

        // kind is "hit" (correct word hit), "wrong" (wrong word hit) or "missed" (correct word got away)
        applyResult: function (state, kind, word) {
            if (kind === "hit") {
                state.hits += 1;
                state.score += RULES.hitPoints;
                state.hitWords.push(word);
            } else if (kind === "wrong") {
                state.fails += 1;
                state.score += RULES.wrongPoints;
                state.wrongWords.push(word);
            } else if (kind === "missed") {
                state.fails += 1;
                state.missedWords.push(word);
            }
            return state;
        },

        getStatus: function (state) {
            if (state.fails >= RULES.maxFails) {
                return "lost";
            }
            if (state.hits >= RULES.winHits) {
                return "won";
            }
            return "playing";
        },

        getLevel: function (hits) {
            return Math.min(RULES.maxLevel, 1 + Math.floor(hits / RULES.levelStepHits));
        },

        getVisibleMs: function (hits, text) {
            const base = Math.max(RULES.minVisibleMs, RULES.startVisibleMs - hits * RULES.speedUpMsPerHit);
            return base + Math.max(0, text.length - 6) * 80;
        },

        getSpawnMs: function (hits) {
            return Math.max(RULES.minSpawnMs, RULES.startSpawnMs - hits * RULES.spawnSpeedUpMsPerHit);
        },

        pickWord: function (words, targetClass, level, random, excludedTexts) {
            const wantTarget = random() < RULES.targetChance;
            const available = words.filter(function (word) {
                return !excludedTexts.has(word.text) && (word.level || 1) <= level;
            });
            const sameKind = available.filter(function (word) {
                return (word.class === targetClass) === wantTarget;
            });
            const wantedLevel = random() < RULES.currentLevelChance ? level : 1 + Math.floor(random() * level);
            const atLevel = sameKind.filter(function (word) { return (word.level || 1) === wantedLevel; });
            const pool = [atLevel, sameKind, available].find(function (list) { return list.length > 0; });
            return pool ? pool[Math.floor(random() * pool.length)] : null;
        },

        overlaps: function (a, b, gap) {
            return a.x < b.x + b.w + gap && b.x < a.x + a.w + gap &&
                a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;
        },

        findPosition: function (areaW, areaH, w, h, rects, random) {
            const maxX = areaW - w;
            const maxY = areaH - h;
            if (maxX < 0 || maxY < 0) {
                return null;
            }
            for (let attempt = 0; attempt < RULES.placementAttempts; attempt += 1) {
                const rect = {
                    x: Math.floor(random() * (maxX + 1)),
                    y: Math.floor(random() * (maxY + 1)),
                    w: w,
                    h: h
                };
                const blocked = rects.some(function (other) {
                    return logic.overlaps(rect, other, RULES.wordGap);
                });
                if (!blocked) {
                    return rect;
                }
            }
            return null;
        }
    };

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function getProblem(exercise) {
        const classes = exercise.classes;
        if (!classes || !classes[exercise.targetClass] || !Array.isArray(exercise.words)) {
            return "Spelet saknar ordklasser eller ord.";
        }
        const valid = exercise.words.every(function (word) {
            return word.text && classes[word.class];
        });
        const targetCount = exercise.words.filter(function (word) {
            return word.class === exercise.targetClass;
        }).length;
        if (!valid || targetCount < 5 || exercise.words.length - targetCount < 5) {
            return "Spelet behöver minst 5 rätta ord och 5 fel ord.";
        }
        return "";
    }

    function describeWord(exercise, word, withExplanation) {
        const info = exercise.classes[word.class];
        let text = info.label + (word.note ? ", " + word.note : "");
        if (withExplanation && info.explanation) {
            text += ". " + info.explanation;
        }
        return text;
    }

    function createWordList(exercise, title, words, withExplanation, emptyText) {
        const section = createElement("section", "game-result-section");
        section.appendChild(createElement("h4", "", title));
        if (words.length === 0) {
            section.appendChild(createElement("p", "", emptyText));
            return section;
        }
        const seen = new Set();
        const list = document.createElement("ul");
        words.forEach(function (word) {
            if (seen.has(word.text)) {
                return;
            }
            seen.add(word.text);
            const item = document.createElement("li");
            item.append(createElement("strong", "", word.text), " – " + describeWord(exercise, word, withExplanation));
            list.appendChild(item);
        });
        section.appendChild(list);
        return section;
    }

    function mount(container, exercise, randomFunction) {
        const random = randomFunction || Math.random;
        const problem = getProblem(exercise);
        if (problem) {
            container.appendChild(createElement("p", "", problem));
            return function () {};
        }

        const targetClass = exercise.targetClass;
        const targetLabel = exercise.classes[targetClass].label;
        const words = exercise.words;

        const root = createElement("section", "game");
        root.setAttribute("aria-label", "Spel");

        const instruction = createElement(
            "p",
            "game-instruction",
            (exercise.instruction || "Slå alla " + targetLabel + ".") + " Försök få så hög poäng som möjligt."
        );

        const scoreText = createElement("span");
        const hitsText = createElement("span");
        const failsText = createElement("span");
        const pauseButton = createElement("button", "", "Pausa");
        pauseButton.type = "button";
        const hud = createElement("div", "game-hud");
        hud.append(scoreText, hitsText, failsText, pauseButton);

        const arena = createElement("div", "arena");
        arena.setAttribute("role", "group");
        arena.setAttribute("aria-label", "Spelyta");

        const hammerBody = createElement("div", "hammer-body");
        const hammer = createElement("div", "hammer");
        hammer.setAttribute("aria-hidden", "true");
        hammer.appendChild(hammerBody);

        const overlay = createElement("div", "arena-overlay");
        const overlayText = createElement("p");
        const overlayButton = createElement("button");
        overlayButton.type = "button";
        overlay.append(overlayText, overlayButton);
        arena.append(hammer, overlay);

        const hint = createElement(
            "p",
            "game-hint",
            "Tips: Med tangentbord trycker du på siffran som står bredvid ordet (1–4)."
        );
        const result = createElement("div", "game-result");
        result.hidden = true;

        root.append(instruction, hud, arena, hint, result);
        container.appendChild(root);

        let phase = "ready";
        let state = logic.createState();
        let clock = 0;
        let lastTimestamp = null;
        let frameId = null;
        let nextSpawnAt = 0;
        let active = [];
        let recentTexts = [];
        let hammerTimer = null;
        const effects = new Set();
        const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function updateHud() {
            scoreText.textContent = "Poäng: " + state.score;
            hitsText.textContent = "Rätt: " + state.hits + " av " + RULES.winHits;
            failsText.textContent = "Fel: " + state.fails + " av " + RULES.maxFails;
        }

        function setPhase(newPhase) {
            phase = newPhase;
            arena.classList.toggle("playing", phase === "playing");
            overlay.hidden = phase === "playing";
            pauseButton.disabled = phase !== "playing";
            if (phase !== "playing") {
                hammer.classList.remove("visible");
            }
        }

        function showOverlay(text, buttonText) {
            overlayText.textContent = text;
            overlayButton.textContent = buttonText;
            overlay.hidden = false;
        }

        function stopLoop() {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        }

        function startLoop() {
            stopLoop();
            lastTimestamp = null;
            frameId = requestAnimationFrame(tick);
        }

        function addEffect(node, ms) {
            arena.appendChild(node);
            const effect = { node: node, timer: null };
            effect.timer = setTimeout(function () {
                node.remove();
                effects.delete(effect);
            }, ms);
            effects.add(effect);
        }

        function clearEffects() {
            effects.forEach(function (effect) {
                clearTimeout(effect.timer);
                effect.node.remove();
            });
            effects.clear();
        }

        function clearActive() {
            active.forEach(function (entry) { entry.element.remove(); });
            active = [];
        }

        function createPointsLabel(entry, text, kind) {
            const label = createElement("span", "points " + kind, text);
            label.style.left = entry.rect.x + "px";
            label.style.top = Math.max(0, entry.rect.y - 28) + "px";
            return label;
        }

        function showHitEffect(entry) {
            entry.element.remove();
            if (!reducedMotion) {
                const confetti = createElement("div", "confetti");
                confetti.style.left = entry.rect.x + entry.rect.w / 2 + "px";
                confetti.style.top = entry.rect.y + entry.rect.h / 2 + "px";
                for (let index = 0; index < 14; index += 1) {
                    const pixel = createElement("span", "pixel-" + (index % 4));
                    pixel.style.setProperty("--dx", Math.round((random() - 0.5) * 140) + "px");
                    pixel.style.setProperty("--dy", Math.round((random() - 0.5) * 100) + "px");
                    confetti.appendChild(pixel);
                }
                addEffect(confetti, RULES.effectMs);
            }
            addEffect(createPointsLabel(entry, "+" + RULES.hitPoints, "good"), RULES.effectMs);
        }

        function showWrongEffect(entry) {
            entry.element.disabled = true;
            entry.element.classList.add("wrong-hit");
            entry.element.appendChild(createElement("span", "cross", "✖"));
            addEffect(createPointsLabel(entry, "−" + Math.abs(RULES.wrongPoints), "bad"), RULES.effectMs);
            const effect = { node: entry.element, timer: null };
            effect.timer = setTimeout(function () {
                entry.element.remove();
                effects.delete(effect);
            }, RULES.effectMs);
            effects.add(effect);
        }

        function showMissedEffect(entry) {
            addEffect(createPointsLabel(entry, "Missad", "missed"), RULES.effectMs);
        }

        function showResult(status) {
            const heading = createElement(
                "h3",
                "",
                status === "won"
                    ? "Bra jobbat! Du slog " + RULES.winHits + " rätta ord."
                    : "Spelet är slut. Du fick " + RULES.maxFails + " fel."
            );
            heading.tabIndex = -1;
            result.replaceChildren(
                heading,
                createElement("p", "game-final-score", "Din poäng: " + state.score),
                createWordList(exercise, "Rätt slagna ord", state.hitWords, false, "Inga."),
                createWordList(exercise, "Rätta ord du missade", state.missedWords, true, "Inga. Bra!"),
                createWordList(exercise, "Fel ord du slog på", state.wrongWords, true, "Inga. Bra!")
            );
            result.hidden = false;
            heading.focus();
        }

        function endGame(status) {
            stopLoop();
            clearActive();
            setPhase("over");
            showOverlay("Spelet är slut. Din poäng: " + state.score, "Spela igen");
            showResult(status);
        }

        function register(kind, word) {
            logic.applyResult(state, kind, word);
            updateHud();
            const status = logic.getStatus(state);
            if (status !== "playing") {
                endGame(status);
            }
        }

        function removeEntry(entry) {
            active = active.filter(function (other) { return other !== entry; });
        }

        function hitWord(entry) {
            if (phase !== "playing" || entry.resolved) {
                return;
            }
            entry.resolved = true;
            removeEntry(entry);
            const isTarget = entry.word.class === targetClass;
            if (isTarget) {
                showHitEffect(entry);
            } else {
                showWrongEffect(entry);
            }
            register(isTarget ? "hit" : "wrong", entry.word);
        }

        function expireWords() {
            active.slice().forEach(function (entry) {
                if (phase !== "playing" || clock < entry.expiresAt) {
                    return;
                }
                entry.resolved = true;
                removeEntry(entry);
                entry.element.remove();
                if (entry.word.class === targetClass) {
                    showMissedEffect(entry);
                    register("missed", entry.word);
                }
            });
        }

        function getFreeSlot() {
            for (let slot = 1; slot <= RULES.maxVisible; slot += 1) {
                if (!active.some(function (entry) { return entry.slot === slot; })) {
                    return slot;
                }
            }
            return null;
        }

        function createWordButton(word, slot) {
            const button = createElement("button", "arena-word");
            button.type = "button";
            button.setAttribute("aria-keyshortcuts", String(slot));
            const badge = createElement("span", "slot", String(slot));
            badge.setAttribute("aria-hidden", "true");
            button.append(badge, document.createTextNode(word.text));
            return button;
        }

        function spawnWord() {
            const slot = getFreeSlot();
            if (slot === null) {
                nextSpawnAt = clock + RULES.retrySpawnMs;
                return;
            }
            const excluded = new Set(recentTexts);
            active.forEach(function (entry) { excluded.add(entry.word.text); });
            const word = logic.pickWord(words, targetClass, logic.getLevel(state.hits), random, excluded);
            if (!word) {
                nextSpawnAt = clock + RULES.retrySpawnMs;
                return;
            }

            const button = createWordButton(word, slot);
            button.style.visibility = "hidden";
            arena.appendChild(button);
            const rect = logic.findPosition(
                arena.clientWidth,
                arena.clientHeight,
                button.offsetWidth,
                button.offsetHeight,
                active.map(function (entry) { return entry.rect; }),
                random
            );
            if (!rect) {
                button.remove();
                nextSpawnAt = clock + RULES.retrySpawnMs;
                return;
            }
            button.style.left = rect.x + "px";
            button.style.top = rect.y + "px";
            button.style.visibility = "";

            const entry = {
                word: word,
                element: button,
                rect: rect,
                slot: slot,
                resolved: false,
                expiresAt: clock + logic.getVisibleMs(state.hits, word.text)
            };
            button.addEventListener("pointerdown", function (event) {
                if (event.pointerType === "mouse" && event.button !== 0) {
                    return;
                }
                event.preventDefault();
                hitWord(entry);
            });
            button.addEventListener("click", function (event) {
                if (event.detail === 0) {
                    hitWord(entry);
                }
            });
            active.push(entry);
            recentTexts.push(word.text);
            recentTexts = recentTexts.slice(-RULES.recentMemory);
            nextSpawnAt = clock + logic.getSpawnMs(state.hits) * (0.8 + random() * 0.4);
        }

        function tick(timestamp) {
            frameId = null;
            if (phase !== "playing") {
                return;
            }
            const elapsed = lastTimestamp === null ? 0 : Math.min(timestamp - lastTimestamp, RULES.maxFrameMs);
            lastTimestamp = timestamp;
            clock += elapsed;
            expireWords();
            if (phase !== "playing") {
                return;
            }
            if (clock >= nextSpawnAt) {
                spawnWord();
            }
            frameId = requestAnimationFrame(tick);
        }

        function startGame() {
            clearActive();
            clearEffects();
            state = logic.createState();
            clock = 0;
            nextSpawnAt = RULES.firstSpawnMs;
            recentTexts = [];
            result.hidden = true;
            result.replaceChildren();
            updateHud();
            setPhase("playing");
            startLoop();
        }

        function pauseGame() {
            if (phase !== "playing") {
                return;
            }
            stopLoop();
            setPhase("paused");
            showOverlay("Spelet är pausat.", "Fortsätt");
            overlayButton.focus();
        }

        function resumeGame() {
            setPhase("playing");
            startLoop();
        }

        function moveHammer(event) {
            const bounds = arena.getBoundingClientRect();
            hammer.style.transform = "translate(" + (event.clientX - bounds.left) + "px, " + (event.clientY - bounds.top) + "px)";
            hammer.classList.add("visible");
        }

        function swingHammer() {
            hammer.classList.remove("swing");
            void hammer.offsetWidth;
            hammer.classList.add("swing");
        }

        function clampWords() {
            active.forEach(function (entry) {
                entry.rect.x = Math.max(0, Math.min(entry.rect.x, arena.clientWidth - entry.rect.w));
                entry.rect.y = Math.max(0, Math.min(entry.rect.y, arena.clientHeight - entry.rect.h));
                entry.element.style.left = entry.rect.x + "px";
                entry.element.style.top = entry.rect.y + "px";
            });
        }

        function handleKeydown(event) {
            if (phase !== "playing" || event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }
            const slot = Number(event.key);
            const entry = active.find(function (other) { return other.slot === slot; });
            if (entry) {
                event.preventDefault();
                hitWord(entry);
            }
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                pauseGame();
            }
        }

        overlayButton.addEventListener("click", function () {
            if (phase === "paused") {
                resumeGame();
            } else {
                startGame();
            }
        });
        pauseButton.addEventListener("click", pauseGame);
        arena.addEventListener("contextmenu", function (event) { event.preventDefault(); });
        arena.addEventListener("pointermove", function (event) {
            if (phase === "playing" && event.pointerType !== "touch") {
                moveHammer(event);
            }
        });
        arena.addEventListener("pointerleave", function (event) {
            if (event.pointerType !== "touch") {
                hammer.classList.remove("visible");
            }
        });
        arena.addEventListener("pointerdown", function (event) {
            if (phase !== "playing") {
                return;
            }
            moveHammer(event);
            swingHammer();
            if (event.pointerType === "touch") {
                clearTimeout(hammerTimer);
                hammerTimer = setTimeout(function () { hammer.classList.remove("visible"); }, RULES.touchHammerMs);
            }
        });
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", pauseGame);
        window.addEventListener("resize", clampWords);

        updateHud();
        setPhase("ready");
        showOverlay("Redo? Slå rätt ord så fort du kan.", "Starta");

        return function destroy() {
            stopLoop();
            clearTimeout(hammerTimer);
            clearEffects();
            document.removeEventListener("keydown", handleKeydown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", pauseGame);
            window.removeEventListener("resize", clampWords);
            phase = "over";
        };
    }

    window.WhackWords = { mount: mount, logic: logic, rules: RULES };
})();
