document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const canvas = document.getElementById("snake-canvas")
  const ctx = canvas.getContext("2d")
  const restartButton = document.getElementById("restart-game-btn")
  const gameOverlay = document.getElementById("game-overlay")
  const gameMessage = document.getElementById("game-message")
  const gameScore = document.getElementById("game-score")
  const hiddenStartBtn = document.getElementById("hidden-start-btn")
  const snakeGameWrapper = document.getElementById("snake-game-wrapper")
  const sliderTrack = document.querySelector(".slider-track")

  // Game variables
  const gridSize = 20
  const tileCount = 20
  const tileSize = canvas.width / tileCount

  let snake = []
  let food = {}
  let direction = "right"
  let nextDirection = "right"
  let score = 0
  let gameSpeed = 150 // milliseconds
  let gameLoop
  let gameRunning = false
  let touchStartX = 0
  let touchStartY = 0

  // Initialize game
  function initGame() {
    // Create snake
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]

    // Create food
    createFood()

    // Reset variables
    direction = "right"
    nextDirection = "right"
    score = 0
    gameSpeed = 150

    // Update score display
    updateScore()

    // Show overlay with start message
    gameOverlay.style.display = "flex"
    gameMessage.textContent = "Press Start to Play"
    restartButton.style.display = "none"
  }

  // Create food at random position
  function createFood() {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    }

    // Make sure food doesn't spawn on snake
    for (let i = 0; i < snake.length; i++) {
      if (food.x === snake[i].x && food.y === snake[i].y) {
        createFood()
        return
      }
    }
  }

  // Update score display
  function updateScore() {
    gameScore.textContent = `Score: ${score}`
  }

  // Game loop
  function gameUpdate() {
    // Move snake
    moveSnake()

    // Check collisions
    if (checkCollision()) {
      gameOver()
      return
    }

    // Check if snake eats food
    if (snake[0].x === food.x && snake[0].y === food.y) {
      // Increase score
      score++
      updateScore()

      // Create new food
      createFood()

      // Increase speed slightly
      if (gameSpeed > 50) {
        gameSpeed -= 2
      }

      // Check win condition (snake fills most of the board)
      if (snake.length >= tileCount * tileCount * 0.75) {
        gameWin()
        return
      }
    } else {
      // Remove tail if snake didn't eat food
      snake.pop()
    }

    // Draw game
    drawGame()

    // Update direction for next frame
    direction = nextDirection

    // Schedule next update
    clearTimeout(gameLoop)
    gameLoop = setTimeout(gameUpdate, gameSpeed)
  }

  // Move snake
  function moveSnake() {
    // Calculate new head position
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

    // Check if snake hits the wall
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver()
      return
    }

    // Add new head to snake
    snake.unshift(head)
  }

  // Check for collisions
  function checkCollision() {
    // Check if snake collides with itself
    for (let i = 1; i < snake.length; i++) {
      if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
        return true
      }
    }

    return false
  }

  // Draw game
  function drawGame() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--game-bg-color") || "#f8f9fa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#e9ecef"
    ctx.lineWidth = 0.5

    // Draw vertical grid lines
    for (let i = 1; i < tileCount; i++) {
      ctx.beginPath()
      ctx.moveTo(i * tileSize, 0)
      ctx.lineTo(i * tileSize, canvas.height)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let i = 1; i < tileCount; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * tileSize)
      ctx.lineTo(canvas.width, i * tileSize)
      ctx.stroke()
    }

    // Draw food
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--food-color") || "#e74c3c"
    ctx.beginPath()
    ctx.arc(food.x * tileSize + tileSize / 2, food.y * tileSize + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
      // Use different color for head
      if (i === 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--secondary-color") || "#3498db"
      } else {
        // Gradient effect for body
        const colorValue = 180 - i * 5
        ctx.fillStyle = `rgb(52, ${colorValue}, 219)`
      }

      // Draw rounded rectangle for snake parts
      roundRect(ctx, snake[i].x * tileSize + 1, snake[i].y * tileSize + 1, tileSize - 2, tileSize - 2, 4)
    }
  }

  // Helper function to draw rounded rectangles
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

  // Game over
  function gameOver() {
    clearTimeout(gameLoop)
    gameRunning = false

    // Show game over message
    gameOverlay.style.display = "flex"
    gameMessage.textContent = "Game Over!"
    restartButton.style.display = "block"
  }

  // Game win
  function gameWin() {
    clearTimeout(gameLoop)
    gameRunning = false

    // Show win message
    gameOverlay.style.display = "flex"
    gameMessage.textContent = "You Win! Amazing!"
    restartButton.style.display = "block"
  }

  // Start game
  function startGame() {
    if (!gameRunning) {
      gameRunning = true
      gameOverlay.style.display = "none"
      gameUpdate()
    }
  }

  // Restart game
  function restartGame() {
    initGame()
  }

  // Event listeners
  hiddenStartBtn.addEventListener("click", () => {
    // Show the game container
    snakeGameWrapper.style.display = "block"
    // Hide the start button
    hiddenStartBtn.style.display = "none"
    // Initialize the game
    initGame()

    // Disable slider track pointer events when game is visible
    if (sliderTrack) {
      sliderTrack.style.pointerEvents = "none"
    }
  })

  restartButton.addEventListener("click", (e) => {
    e.stopPropagation() // Prevent event from bubbling up
    restartGame()
    startGame()
  })

  // Keyboard controls
  document.addEventListener("keydown", (event) => {
    // Only process key events if game is running
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

  // Touch controls for mobile - updated to prevent propagation
  canvas.addEventListener(
    "touchstart",
    (event) => {
      // Always stop propagation to prevent slider from capturing the event
      event.stopPropagation()

      if (!gameRunning) return

      touchStartX = event.touches[0].clientX
      touchStartY = event.touches[0].clientY

      // Prevent default to avoid scrolling
      event.preventDefault()
    },
    { passive: false },
  )

  canvas.addEventListener(
    "touchmove",
    (event) => {
      // Always stop propagation
      event.stopPropagation()

      // Prevent default to avoid scrolling
      event.preventDefault()
    },
    { passive: false },
  )

  canvas.addEventListener(
    "touchend",
    (event) => {
      // Always stop propagation
      event.stopPropagation()

      if (!gameRunning) return

      const touchEndX = event.changedTouches[0].clientX
      const touchEndY = event.changedTouches[0].clientY

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      // Determine swipe direction based on which delta is larger
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 50) {
          // Swipe right
          if (direction !== "left") nextDirection = "right"
        } else if (deltaX < -50) {
          // Swipe left
          if (direction !== "right") nextDirection = "left"
        }
      } else {
        // Vertical swipe
        if (deltaY > 50) {
          // Swipe down
          if (direction !== "up") nextDirection = "down"
        } else if (deltaY < -50) {
          // Swipe up
          if (direction !== "down") nextDirection = "up"
        }
      }

      // Prevent default to avoid scrolling
      event.preventDefault()
    },
    { passive: false },
  )

  // Add click event to game overlay to start game
  gameOverlay.addEventListener("click", (e) => {
    e.stopPropagation() // Prevent event from bubbling up

    if (!gameRunning) {
      startGame()
    }
  })
})
