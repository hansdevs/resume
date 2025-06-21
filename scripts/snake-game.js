document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("snake-canvas");
    const ctx = canvas.getContext("2d");
    const wrapper = document.getElementById("snake-game-wrapper");
    const connectRow = document.querySelector(".connect-grid");
    const restartBtn = document.getElementById("restart-game-btn");
    const overlay = document.getElementById("game-overlay");
    const msg = document.getElementById("game-message");
    const scoreBox = document.getElementById("game-score");
    const boredBtn = document.getElementById("hidden-start-btn");
    const sliderTrack = document.querySelector(".slider-track");
    const TILE_COUNT = 20;
    let tileSize = 20;
    const resize = () => {
        const targetW = connectRow ? connectRow.offsetWidth : 400;
        canvas.width = targetW;
        canvas.height = targetW;
        tileSize = canvas.width / TILE_COUNT;
        if (gameRunning) draw();
    };
    new ResizeObserver(resize).observe(connectRow || document.body);
    window.addEventListener("resize", resize);
    const dirs = { up: 0, right: 1, down: 2, left: 3 };
    let snake, food, dir, nextDir, score, speed, loop, gameRunning = false;
    const hiKey = "snake-hi-score";
    const rnd = (n) => Math.floor(Math.random() * n);
    function init() {
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        dir = nextDir = dirs.right;
        placeFood();
        score = 0;
        speed = 150;
        scoreBox.textContent = `Score: ${score} | High: ${localStorage.getItem(hiKey) || 0}`;
        overlay.style.display = "flex";
        msg.textContent = "Press Start or P";
        restartBtn.style.display = "none";
        resize();
    }
    function placeFood() {
        food = { x: rnd(TILE_COUNT), y: rnd(TILE_COUNT) };
        while (snake.some(s => s.x === food.x && s.y === food.y)) placeFood();
    }
    function gameTick() {
        move();
        if (hitWall() || hitSelf()) {
            gameOver();
            return;
        }
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            speed = Math.max(50, speed - 2);
            placeFood();
            scoreBox.textContent = `Score: ${score} | High: ${localStorage.getItem(hiKey) || 0}`;
        } else {
            snake.pop();
        }
        draw();
        dir = nextDir;
        loop = setTimeout(gameTick, speed);
    }
    function move() {
        const head = { ...snake[0] };
        if (nextDir === dirs.up) head.y--;
        else if (nextDir === dirs.down) head.y++;
        else if (nextDir === dirs.left) head.x--;
        else if (nextDir === dirs.right) head.x++;
        snake.unshift(head);
    }
    const hitWall = () => snake[0].x < 0 || snake[0].x >= TILE_COUNT || snake[0].y < 0 || snake[0].y >= TILE_COUNT;
    const hitSelf = () => snake.slice(1).some(s => s.x === snake[0].x && s.y === snake[0].y);
    function gameOver() {
        clearTimeout(loop);
        gameRunning = false;
        msg.textContent = "Game Over!";
        restartBtn.style.display = "block";
        overlay.style.display = "flex";
        updateHigh();
    }
    function updateHigh() {
        const hi = +localStorage.getItem(hiKey) || 0;
        if (score > hi) localStorage.setItem(hiKey, score);
        scoreBox.textContent = `Score: ${score} | High: ${localStorage.getItem(hiKey)}`;
    }
    function draw() {
        ctx.fillStyle = getCSS("--game-bg-color", "#f8f9fa");
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#e9ecef";
        ctx.lineWidth = 0.5;
        for (let i = 1; i < TILE_COUNT; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileSize, 0);
            ctx.lineTo(i * tileSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * tileSize);
            ctx.lineTo(canvas.width, i * tileSize);
            ctx.stroke();
        }
        ctx.fillStyle = getCSS("--food-color", "#e74c3c");
        ctx.beginPath();
        ctx.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        snake.forEach((s, i) => {
            ctx.fillStyle = i === 0 ? getCSS("--secondary-color", "#3498db") : `rgb(52,${180 - i * 5},219)`;
            roundRect(s.x * tileSize + 1, s.y * tileSize + 1, tileSize - 2, tileSize - 2, 4);
        });
    }
    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }
    const getCSS = (prop, def) => getComputedStyle(document.documentElement).getPropertyValue(prop) || def;
    const keyDir = {
        w: dirs.up, ArrowUp: dirs.up,
        s: dirs.down, ArrowDown: dirs.down,
        a: dirs.left, ArrowLeft: dirs.left,
        d: dirs.right, ArrowRight: dirs.right
    };
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p") {
            togglePause();
            return;
        }
        const nd = keyDir[e.key];
        if (nd === undefined || !gameRunning) return;
        if ((dir + 2) % 4 !== nd) nextDir = nd;
    });
    let tX = 0, tY = 0;
    canvas.addEventListener("touchstart", e => {
        if (!gameRunning) return;
        tX = e.touches[0].clientX; tY = e.touches[0].clientY; e.preventDefault();
    }, { passive: false });
    canvas.addEventListener("touchend", e => {
        if (!gameRunning) return;
        const dX = e.changedTouches[0].clientX - tX;
        const dY = e.changedTouches[0].clientY - tY;
        if (Math.abs(dX) > Math.abs(dY)) {
            if (dX > 40 && dir !== dirs.left) nextDir = dirs.right;
            if (dX < -40 && dir !== dirs.right) nextDir = dirs.left;
        } else {
            if (dY > 40 && dir !== dirs.up) nextDir = dirs.down;
            if (dY < -40 && dir !== dirs.down) nextDir = dirs.up;
        }
    }, { passive: false });
    boredBtn.addEventListener("click", () => {
        wrapper.style.display = "block";
        boredBtn.style.display = "none";
        if (sliderTrack) sliderTrack.style.pointerEvents = "none";
        init();
    });
    restartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        init();
        start();
    });
    overlay.addEventListener("click", () => {
        if (!gameRunning) start();
    });
    function start() {
        overlay.style.display = "none";
        gameRunning = true;
        window.focus();
        clearTimeout(loop);
        loop = setTimeout(gameTick, speed);
    }
    function togglePause() {
        if (!gameRunning) return;
        if (loop) {
            clearTimeout(loop);
            loop = null;
            msg.textContent = "Paused - P to Resume";
            overlay.style.display = "flex";
        } else {
            overlay.style.display = "none";
            loop = setTimeout(gameTick, speed);
        }
    }
    init();
});
