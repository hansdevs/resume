(function () {
  var canvas = document.getElementById("snake-canvas");
  var ctx = canvas.getContext("2d");
  var overlay = document.getElementById("game-overlay");
  var msg = document.getElementById("game-message");
  var scoreEl = document.getElementById("game-score");
  var restartBtn = document.getElementById("restart-btn");

  var TILE = 20;
  var tileSize, cols = TILE, rows = TILE;
  var DIRS = { up: 0, right: 1, down: 2, left: 3 };
  var HI_KEY = "snake-hi";

  var iconSrcs = [
    "/images/vscode.png",
    "/images/gitlogo.png",
    "/images/docker.png",
    "/images/supabase.png",
    "/images/Xcode.png",
    "/images/eclipselogo.png",
    "/images/IntelliJDEAlogo.png",
    "/images/swiftplaygrounds.png",
    "/images/ubuntu.png",
    "/images/appstorelogo.png"
  ];
  var icons = [];
  var iconsReady = 0;
  iconSrcs.forEach(function (src) {
    var img = new Image();
    img.onload = function () { iconsReady++; };
    img.src = src;
    icons.push(img);
  });

  var snake, foods, dir, nextDir, score, speed, loop, running;

  function resize() {
    var size = Math.min(canvas.parentElement.clientWidth - 32, 460);
    canvas.width = size;
    canvas.height = size;
    tileSize = size / TILE;
    if (running) draw();
  }
  window.addEventListener("resize", resize);
  resize();

  function randomIcon() {
    var loaded = icons.filter(function (img) { return img.complete && img.naturalWidth > 0; });
    if (loaded.length === 0) return null;
    return loaded[Math.floor(Math.random() * loaded.length)];
  }

  function isOccupied(x, y) {
    if (snake.some(function (s) { return s.x === x && s.y === y; })) return true;
    if (foods.some(function (f) { return f.x === x && f.y === y; })) return true;
    return false;
  }

  function spawnOne() {
    var tries = 0;
    var pos;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      tries++;
    } while (isOccupied(pos.x, pos.y) && tries < 200);
    if (tries >= 200) return;
    pos.icon = randomIcon();
    foods.push(pos);
  }

  function init() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = nextDir = DIRS.right;
    score = 0;
    speed = 140;
    running = false;
    foods = [];
    spawnOne();
    updateScore();
    overlay.style.display = "flex";
    msg.textContent = "Tap or Press to Start";
    restartBtn.style.display = "none";
    draw();
  }

  function updateScore() {
    var hi = +localStorage.getItem(HI_KEY) || 0;
    scoreEl.textContent = "Score: " + score + "  |  Best: " + Math.max(score, hi);
  }

  function tick() {
    var head = { x: snake[0].x, y: snake[0].y };
    if (nextDir === DIRS.up) head.y--;
    else if (nextDir === DIRS.down) head.y++;
    else if (nextDir === DIRS.left) head.x--;
    else head.x++;
    dir = nextDir;

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      clearTimeout(loop);
      running = false;
      var hi = +localStorage.getItem(HI_KEY) || 0;
      if (score > hi) localStorage.setItem(HI_KEY, score);
      updateScore();
      msg.textContent = "Game Over";
      restartBtn.style.display = "inline-block";
      overlay.style.display = "flex";
      return;
    }

    snake.unshift(head);

    var eaten = -1;
    for (var i = 0; i < foods.length; i++) {
      if (foods[i].x === head.x && foods[i].y === head.y) { eaten = i; break; }
    }

    if (eaten >= 0) {
      foods.splice(eaten, 1);
      score++;
      speed = Math.max(55, speed - 2);
      updateScore();
      spawnOne();
      if (Math.random() < 0.3) spawnOne();
      if (Math.random() < 0.08) { spawnOne(); spawnOne(); }
    } else {
      snake.pop();
    }

    draw();
    loop = setTimeout(tick, speed);
  }

  function draw() {
    ctx.fillStyle = "#12122a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (var i = 1; i < cols; i++) {
      ctx.beginPath(); ctx.moveTo(i * tileSize, 0); ctx.lineTo(i * tileSize, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * tileSize); ctx.lineTo(canvas.width, i * tileSize); ctx.stroke();
    }

    var pad = 2;
    foods.forEach(function (f) {
      if (f.icon && f.icon.complete && f.icon.naturalWidth > 0) {
        ctx.drawImage(f.icon, f.x * tileSize + pad, f.y * tileSize + pad, tileSize - pad * 2, tileSize - pad * 2);
      } else {
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.arc(f.x * tileSize + tileSize / 2, f.y * tileSize + tileSize / 2, tileSize / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    snake.forEach(function (s, i) {
      var b = Math.max(100, 200 - i * 6);
      ctx.fillStyle = i === 0 ? "#8b5cf6" : "rgb(" + b + "," + b + "," + (b + 40) + ")";
      var r = 3;
      var x = s.x * tileSize + 1, y = s.y * tileSize + 1, w = tileSize - 2, h = tileSize - 2;
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
    });
  }

  function start() {
    overlay.style.display = "none";
    running = true;
    clearTimeout(loop);
    loop = setTimeout(tick, speed);
  }

  var keyMap = { w: DIRS.up, ArrowUp: DIRS.up, s: DIRS.down, ArrowDown: DIRS.down, a: DIRS.left, ArrowLeft: DIRS.left, d: DIRS.right, ArrowRight: DIRS.right };
  window.addEventListener("keydown", function (e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) !== -1) e.preventDefault();
    var nd = keyMap[e.key];
    if (nd !== undefined && running && (dir + 2) % 4 !== nd) nextDir = nd;
  });

  var tX = 0, tY = 0;
  canvas.addEventListener("touchstart", function (e) { tX = e.touches[0].clientX; tY = e.touches[0].clientY; e.preventDefault(); }, { passive: false });
  canvas.addEventListener("touchend", function (e) {
    if (!running) return;
    var dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
    if (Math.abs(dX) > Math.abs(dY)) {
      if (dX > 30 && dir !== DIRS.left) nextDir = DIRS.right;
      if (dX < -30 && dir !== DIRS.right) nextDir = DIRS.left;
    } else {
      if (dY > 30 && dir !== DIRS.up) nextDir = DIRS.down;
      if (dY < -30 && dir !== DIRS.down) nextDir = DIRS.up;
    }
  }, { passive: false });

  overlay.addEventListener("click", function () { if (!running && msg.textContent !== "Game Over") start(); });
  restartBtn.addEventListener("click", function (e) { e.stopPropagation(); init(); start(); });

  init();
})();
