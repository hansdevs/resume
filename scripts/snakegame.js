window.createSnake = function (opts) {
  "use strict";
  const render = opts.render;
  const onExit = opts.onExit;
  const coarse = !!opts.coarse;

  const COLS = 24, ROWS = 11, SPEED = 150;
  let snake, dir, nextDir, food, score, timer = null, dead = false;

  function placeFood() {
    let c;
    do { c = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 }; }
    while (snake.some((s) => s.x === c.x && s.y === c.y));
    food = c;
  }
  function setDir(x, y) {
    if (dead) return;
    if (x === -dir.x && y === -dir.y) return;
    nextDir = { x, y };
  }
  function start() {
    snake = [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }];
    dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
    score = 0; dead = false; placeFood();
    clearInterval(timer); timer = setInterval(tick, SPEED);
    draw();
  }
  function tick() {
    dir = nextDir;
    const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.x >= COLS || h.y < 0 || h.y >= ROWS || snake.some((s) => s.x === h.x && s.y === h.y)) {
      clearInterval(timer); timer = null; dead = true; draw(); return;
    }
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; placeFood(); } else snake.pop();
    draw();
  }
  function draw() {
    const occ = new Set(snake.map((s) => s.x + "," + s.y));
    const tip = coarse ? "swipe to move · back quits" : "wasd / arrows to move · ctrl+c quits";
    let html = '<div class="t-line tdim">snake@hansgamlien · eat the o\'s · ' + tip + "</div>";
    html += '<div class="t-line ta">score ' + score + "</div>";
    for (let y = 0; y < ROWS; y++) {
      let row = "";
      for (let x = 0; x < COLS; x++) {
        const k = x + "," + y;
        if (occ.has(k)) row += '<span class="g-worm">#</span>';
        else if (food.x === x && food.y === y) row += '<span class="g-food">o</span>';
        else row += '<span class="g-dot">·</span>';
      }
      html += '<div class="t-line game">' + row + "</div>";
    }
    if (dead) {
      html += '<div class="t-line ta">game over · score ' + score + "</div>";
      html += '<div class="t-line game-over">' +
        '<button type="button" class="g-btn" data-game="again">play again</button>' +
        '<button type="button" class="g-btn" data-game="back">back</button>' +
        "</div>";
    }
    render(html, { dead: dead, score: score });
  }
  function quit(echo) { clearInterval(timer); timer = null; onExit(echo); }
  function key(e) {
    const k = (e.key || "").toLowerCase();
    if (e.ctrlKey && k === "c") { e.preventDefault(); quit("^C"); return; }
    if (k === " " || k.indexOf("arrow") === 0) e.preventDefault();
    if (dead) {
      if (k === " " || k === "enter") start();
      else if (k === "escape" || k === "q") quit();
      return;
    }
    if (k === "arrowup" || k === "w") setDir(0, -1);
    else if (k === "arrowdown" || k === "s") setDir(0, 1);
    else if (k === "arrowleft" || k === "a") setDir(-1, 0);
    else if (k === "arrowright" || k === "d") setDir(1, 0);
    else if (k === "escape" || k === "q") quit();
  }
  function swipe(dx, dy) {
    if (dead) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0); else setDir(0, dy > 0 ? 1 : -1);
  }

  start();
  return {
    key: key,
    swipe: swipe,
    again: start,
    back: function () { quit(); },
    stop: function () { clearInterval(timer); timer = null; },
  };
};
