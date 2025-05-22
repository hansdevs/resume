document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("snake-canvas")
    const ctx = canvas.getContext("2d")
    const restartButton = document.getElementById("restart-game-btn")
    const gameOverlay = document.getElementById("game-overlay")
    const gameMessage = document.getElementById("game-message")
    const gameScore = document.getElementById("game-score")
    const hiddenStartBtn = document.getElementById("hidden-start-btn")
    const snakeGameWrapper = document.getElementById("snake-game-wrapper")
    const sliderTrack = document.querySelector(".slider-track")

    const gridSize = 20
    const tileCount = 20
    const tileSize = canvas.width / tileCount

    let snake = []
    let food = {}
    let direction = "right"
    let nextDirection = "right"
    let score = 0
    let gameSpeed = 150
    let gameLoop
    let gameRunning = false
    let touchStartX = 0
    let touchStartY = 0

    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 },
        ]
        createFood()
        direction = "right"
        nextDirection = "right"
        score = 0
        gameSpeed = 150
        updateScore()
        gameOverlay.style.display = "flex"
        gameMessage.textContent = "Press Start to Play"
        restartButton.style.display = "none"
    }

    function createFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        }
        for (let i = 0; i < snake.length; i++) {
            if (food.x === snake[i].x && food.y === snake[i].y) {
                createFood()
                return
            }
        }
    }

    function updateScore() {
        gameScore.textContent = `Score: ${score}`
    }

    function gameUpdate() {
        moveSnake()
        if (checkCollision()) {
            gameOver()
            return
        }
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++
            updateScore()
            createFood()
            if (gameSpeed > 50) {
                gameSpeed -= 2
            }
            if (snake.length >= tileCount * tileCount * 0.75) {
                gameWin()
                return
            }
        } else {
            snake.pop()
        }
        drawGame()
        direction = nextDirection
        clearTimeout(gameLoop)
        gameLoop = setTimeout(gameUpdate, gameSpeed)
    }

    function moveSnake() {
        const head = { x: snake[0].x, y: snake[0].y }
        switch (direction) {
            case "up":
                head.y--
                break
            case "down":
                head.y++
                break
            case "left":
                head.x--
                break
            case "right":
                head.x++
                break
        }
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver()
            return
        }
        snake.unshift(head)
    }

    function checkCollision() {
        for (let i = 1; i < snake.length; i++) {
            if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                return true
            }
        }
        return false
    }

    function drawGame() {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--game-bg-color") || "#f8f9fa"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#e9ecef"
        ctx.lineWidth = 0.5
        for (let i = 1; i < tileCount; i++) {
            ctx.beginPath()
            ctx.moveTo(i * tileSize, 0)
            ctx.lineTo(i * tileSize, canvas.height)
            ctx.stroke()
        }
        for (let i = 1; i < tileCount; i++) {
            ctx.beginPath()
            ctx.moveTo(0, i * tileSize)
            ctx.lineTo(canvas.width, i * tileSize)
            ctx.stroke()
        }
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--food-color") || "#e74c3c"
        ctx.beginPath()
        ctx.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2)
        ctx.fill()
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--secondary-color") || "#3498db"
            } else {
                const colorValue = 180 - i * 5
                ctx.fillStyle = `rgb(52, ${colorValue}, 219)`
            }
            roundRect(ctx, snake[i].x * tileSize + 1, snake[i].y * tileSize + 1, tileSize - 2, tileSize - 2, 4)
        }
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
    }

    function gameOver() {
        clearTimeout(gameLoop)
        gameRunning = false
        gameOverlay.style.display = "flex"
        gameMessage.textContent = "Game Over!"
        restartButton.style.display = "block"
    }

    function gameWin() {
        clearTimeout(gameLoop)
        gameRunning = false
        gameOverlay.style.display = "flex"
        gameMessage.textContent = "You Win! Amazing!"
        restartButton.style.display = "block"
    }

    function startGame() {
        if (!gameRunning) {
            gameRunning = true
            gameOverlay.style.display = "none"
            gameUpdate()
        }
    }

    function restartGame() {
        initGame()
    }

    hiddenStartBtn.addEventListener("click", () => {
        snakeGameWrapper.style.display = "block"
        hiddenStartBtn.style.display = "none"
        initGame()
        if (sliderTrack) {
            sliderTrack.style.pointerEvents = "none"
        }
    })

    restartButton.addEventListener("click", (e) => {
        e.stopPropagation()
        restartGame()
        startGame()
    })

    document.addEventListener("keydown", (event) => {
        if (!gameRunning) return
        switch (event.key.toLowerCase()) {
            case "w":
            case "arrowup":
                if (direction !== "down") nextDirection = "up"
                break
            case "s":
            case "arrowdown":
                if (direction !== "up") nextDirection = "down"
                break
            case "a":
            case "arrowleft":
                if (direction !== "right") nextDirection = "left"
                break
            case "d":
            case "arrowright":
                if (direction !== "left") nextDirection = "right"
                break
        }
    })

    canvas.addEventListener(
        "touchstart",
        (event) => {
            event.stopPropagation()
            if (!gameRunning) return
            touchStartX = event.touches[0].clientX
            touchStartY = event.touches[0].clientY
            event.preventDefault()
        },
        { passive: false },
    )

    canvas.addEventListener(
        "touchmove",
        (event) => {
            event.stopPropagation()
            event.preventDefault()
        },
        { passive: false },
    )

    canvas.addEventListener(
        "touchend",
        (event) => {
            event.stopPropagation()
            if (!gameRunning) return
            const touchEndX = event.changedTouches[0].clientX
            const touchEndY = event.changedTouches[0].clientY
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    if (direction !== "left") nextDirection = "right"
                } else if (deltaX < -50) {
                    if (direction !== "right") nextDirection = "left"
                }
            } else {
                if (deltaY > 50) {
                    if (direction !== "up") nextDirection = "down"
                } else if (deltaY < -50) {
                    if (direction !== "down") nextDirection = "up"
                }
            }
            event.preventDefault()
        },
        { passive: false },
    )

    gameOverlay.addEventListener("click", (e) => {
        e.stopPropagation()
        if (!gameRunning) {
            startGame()
        }
    })
})
