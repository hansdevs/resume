class PongGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas")
    this.ctx = this.canvas.getContext("2d")
    this.overlay = document.getElementById("gameOverlay")
    this.startBtn = document.getElementById("startBtn")
    this.pauseBtn = document.getElementById("pauseBtn")
    this.countdownDisplay = document.getElementById("countdownDisplay")

    // Game state
    this.gameRunning = false
    this.gamePaused = false
    this.gameStarted = false
    this.countdownActive = false
    this.countdownTimer = 0

    // Score and lives
    this.playerScore = 0
    this.aiScore = 0
    this.playerLives = 3
    this.aiLives = 3

    // Game objects
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      dx: 0, // Start with 0 velocity
      dy: 0,
      radius: 8,
      speed: 5,
      maxSpeed: 12,
    }

    this.playerPaddle = {
      x: 20,
      y: this.canvas.height / 2 - 50,
      width: 12,
      height: 100,
      speed: 8,
    }

    this.aiPaddle = {
      x: this.canvas.width - 32,
      y: this.canvas.height / 2 - 50,
      width: 12,
      height: 100,
      speed: 7.5,
    }

    // Power-up system
    this.powerUp = {
      active: false,
      x: 0,
      y: 0,
      radius: 15,
      collected: false,
      spawnTimer: 0,
      spawnInterval: 600,
      duration: 300,
      timer: 0,
    }

    this.speedBoostActive = false
    this.speedBoostTimer = 0

    this.init()
  }

  init() {
    if (this.startBtn) {
      this.startBtn.addEventListener("click", () => this.startGame())
    }
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener("click", () => this.togglePause())
    }
    if (this.canvas) {
      this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    }

    document.addEventListener("keydown", (e) => this.handleKeyPress(e))

    this.updateDisplay()
    this.gameLoop()
  }

  startGame() {
    console.log("Starting game...")
    
    // Reset everything for new game
    if (!this.gameStarted) {
      this.resetGame()
    }

    this.gameStarted = true
    this.gamePaused = false

    // Hide overlay
    if (this.overlay) {
      this.overlay.classList.add("hidden")
    }

    // Start countdown immediately
    this.startCountdown()

    // Set cursor
    if (this.canvas) {
      this.canvas.style.cursor = "none"
    }

    // Reset button text
    if (this.startBtn) {
      this.startBtn.textContent = "START GAME"
    }
    if (this.pauseBtn) {
      this.pauseBtn.textContent = "PAUSE"
    }
  }

  startCountdown() {
    console.log("Starting countdown...")
    this.countdownActive = true
    this.countdownTimer = 180 // 3 seconds at 60fps (3, 2, 1)
    this.gameRunning = false // Stop game during countdown
    
    // Reset ball to center and stop it
    this.ball.x = this.canvas.width / 2
    this.ball.y = this.canvas.height / 2
    this.ball.dx = 0
    this.ball.dy = 0
  }

  updateCountdown() {
    if (!this.countdownActive) return

    this.countdownTimer--
    const secondsLeft = Math.ceil(this.countdownTimer / 60)

    if (this.countdownDisplay) {
      if (secondsLeft > 0) {
        // Show 3, 2, 1
        this.countdownDisplay.textContent = secondsLeft
        this.countdownDisplay.classList.remove("go")
        this.countdownDisplay.classList.add("show")
      } else if (this.countdownTimer > 0) {
        // Show GO! for a brief moment
        this.countdownDisplay.textContent = "GO!"
        this.countdownDisplay.classList.add("go")
      } else {
        // Countdown finished - start the game!
        console.log("Countdown finished, starting game!")
        this.countdownDisplay.classList.remove("show", "go")
        this.countdownActive = false
        this.gameRunning = true
        
        // NOW reset the ball with velocity to start playing
        this.resetBallWithVelocity()
      }
    }
  }

  resetBallWithVelocity() {
    console.log("Resetting ball with velocity...")
    this.ball.x = this.canvas.width / 2
    this.ball.y = this.canvas.height / 2
    
    // Give ball random direction and speed
    const direction = Math.random() > 0.5 ? 1 : -1
    this.ball.dx = direction * this.ball.speed
    this.ball.dy = (Math.random() - 0.5) * 6
    
    console.log("Ball velocity:", this.ball.dx, this.ball.dy)
  }

  togglePause() {
    if (!this.gameStarted || this.countdownActive) return

    this.gamePaused = !this.gamePaused

    if (this.pauseBtn) {
      this.pauseBtn.textContent = this.gamePaused ? "RESUME" : "PAUSE"
    }

    if (this.gamePaused) {
      this.showOverlay("PAUSED", "Click RESUME to continue")
    } else {
      if (this.overlay) {
        this.overlay.classList.add("hidden")
      }
    }
  }

  handleMouseMove(e) {
    if (!this.gameRunning || this.gamePaused || this.countdownActive) return

    const rect = this.canvas.getBoundingClientRect()
    const mouseY = e.clientY - rect.top
    this.playerPaddle.y = mouseY - this.playerPaddle.height / 2

    // Keep paddle within bounds
    this.playerPaddle.y = Math.max(0, Math.min(this.canvas.height - this.playerPaddle.height, this.playerPaddle.y))
  }

  handleKeyPress(e) {
    if (e.code === "Space") {
      e.preventDefault()
      this.togglePause()
    }
  }

  updateAI() {
    const ballCenterY = this.ball.y
    let targetY = ballCenterY

    if (this.ball.dx > 0) {
      // Ball moving towards AI
      const timeToReach = (this.aiPaddle.x - this.ball.x) / Math.abs(this.ball.dx)
      if (timeToReach > 0) {
        targetY = this.ball.y + this.ball.dy * timeToReach

        // Account for wall bounces
        if (targetY < 0) {
          targetY = Math.abs(targetY)
        } else if (targetY > this.canvas.height) {
          targetY = this.canvas.height - (targetY - this.canvas.height)
        }
      }
    }

    // Add slight randomness for 90% accuracy (10% miss chance)
    if (Math.random() < 0.1) {
      targetY += (Math.random() - 0.5) * 80
    }

    // Smooth movement towards target
    const targetPaddleY = targetY - this.aiPaddle.height / 2
    const currentY = this.aiPaddle.y
    const diff = targetPaddleY - currentY

    const moveSpeed = this.aiPaddle.speed

    if (Math.abs(diff) > 1) {
      const moveAmount = Math.min(Math.abs(diff), moveSpeed) * Math.sign(diff)
      this.aiPaddle.y += moveAmount * 0.8
    }

    // Keep AI paddle within bounds
    this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y))
  }

  updateBall() {
    this.ball.x += this.ball.dx
    this.ball.y += this.ball.dy

    // Top and bottom wall collision
    if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
      this.ball.dy = -this.ball.dy
    }

    // Player paddle collision
    if (
      this.ball.x <= this.playerPaddle.x + this.playerPaddle.width + this.ball.radius &&
      this.ball.x >= this.playerPaddle.x &&
      this.ball.y >= this.playerPaddle.y &&
      this.ball.y <= this.playerPaddle.y + this.playerPaddle.height
    ) {
      this.ball.dx = Math.abs(this.ball.dx)

      // Add spin based on where ball hits paddle
      const hitPos = (this.ball.y - this.playerPaddle.y) / this.playerPaddle.height
      this.ball.dy = (hitPos - 0.5) * 8

      // Increase speed slightly
      this.ball.dx = Math.min(this.ball.dx * 1.05, this.ball.maxSpeed)
    }

    // AI paddle collision
    if (
      this.ball.x >= this.aiPaddle.x - this.ball.radius &&
      this.ball.x <= this.aiPaddle.x + this.aiPaddle.width &&
      this.ball.y >= this.aiPaddle.y &&
      this.ball.y <= this.aiPaddle.y + this.aiPaddle.height
    ) {
      this.ball.dx = -Math.abs(this.ball.dx)

      // Add spin
      const hitPos = (this.ball.y - this.aiPaddle.y) / this.aiPaddle.height
      this.ball.dy = (hitPos - 0.5) * 8

      // Increase speed slightly
      this.ball.dx = Math.max(this.ball.dx * 1.05, -this.ball.maxSpeed)
    }

    // Score detection
    if (this.ball.x < 0) {
      console.log("AI scored!")
      this.aiScore++
      this.playerLives--
      this.updateDisplay()
      this.checkGameOver()
      if (this.gameRunning) {
        this.startCountdown() // Start countdown after goal
      }
    } else if (this.ball.x > this.canvas.width) {
      console.log("Player scored!")
      this.playerScore++
      this.aiLives--
      this.updateDisplay()
      this.checkGameOver()
      if (this.gameRunning) {
        this.startCountdown() // Start countdown after goal
      }
    }
  }

  updatePowerUp() {
    // Spawn power-up
    if (!this.powerUp.active) {
      this.powerUp.spawnTimer++
      if (this.powerUp.spawnTimer >= this.powerUp.spawnInterval) {
        if (Math.random() < 0.3) {
          this.spawnPowerUp()
        }
        this.powerUp.spawnTimer = 0
      }
    }

    // Check power-up collection
    if (this.powerUp.active && !this.powerUp.collected) {
      const dist = Math.sqrt(Math.pow(this.ball.x - this.powerUp.x, 2) + Math.pow(this.ball.y - this.powerUp.y, 2))

      if (dist < this.ball.radius + this.powerUp.radius) {
        this.collectPowerUp()
      }
    }

    // Update speed boost
    if (this.speedBoostActive) {
      this.speedBoostTimer--
      if (this.speedBoostTimer <= 0) {
        this.speedBoostActive = false
        this.ball.maxSpeed = 12
      }
    }
  }

  spawnPowerUp() {
    this.powerUp.active = true
    this.powerUp.collected = false
    this.powerUp.x = this.canvas.width / 2 + (Math.random() - 0.5) * 200
    this.powerUp.y = this.canvas.height / 2 + (Math.random() - 0.5) * 150
    this.powerUp.timer = this.powerUp.duration
  }

  collectPowerUp() {
    this.powerUp.collected = true
    this.powerUp.active = false
    this.speedBoostActive = true
    this.speedBoostTimer = 300
    this.ball.maxSpeed = 18

    // Immediately boost current ball speed
    this.ball.dx *= 1.5
    this.ball.dy *= 1.2
  }

  checkGameOver() {
    if (this.playerLives <= 0 || this.aiLives <= 0) {
      console.log("Game over!")
      this.gameRunning = false
      this.gameStarted = false
      this.gamePaused = false
      this.countdownActive = false

      if (this.pauseBtn) {
        this.pauseBtn.textContent = "PAUSE"
      }

      this.showGameOverScreen()
    }
  }

  showGameOverScreen() {
    const playerWon = this.aiLives <= 0
    let message = ""

    if (playerWon) {
      message = `🎉 VICTORY! 🎉\nYou beat the AI ${this.playerScore} - ${this.aiScore}!\nGreat job!`
    } else {
      message = `💀 GAME OVER 💀\nAI wins ${this.aiScore} - ${this.playerScore}\nTry again!`
    }

    const overlayTitle = document.getElementById("overlayTitle")
    const overlayText = document.getElementById("overlayText")
    const startBtn = document.getElementById("startBtn")

    if (overlayTitle) {
      overlayTitle.textContent = playerWon ? "YOU WIN!" : "GAME OVER"
    }
    if (overlayText) {
      overlayText.innerHTML = message.replace(/\n/g, "<br>")
    }
    if (startBtn) {
      startBtn.textContent = "PLAY AGAIN"
    }
    if (this.overlay) {
      this.overlay.classList.remove("hidden")
    }
    if (this.canvas) {
      this.canvas.style.cursor = "default"
    }
  }

  resetGame() {
    console.log("Resetting game...")
    this.playerScore = 0
    this.aiScore = 0
    this.playerLives = 3
    this.aiLives = 3
    this.speedBoostActive = false
    this.speedBoostTimer = 0
    this.powerUp.active = false
    this.powerUp.spawnTimer = 0
    this.countdownActive = false
    this.gameRunning = false
    
    // Reset ball to center with no velocity
    this.ball.x = this.canvas.width / 2
    this.ball.y = this.canvas.height / 2
    this.ball.dx = 0
    this.ball.dy = 0
    this.ball.maxSpeed = 12
    
    this.updateDisplay()
  }

  showOverlay(title, text) {
    const overlayTitle = document.getElementById("overlayTitle")
    const overlayText = document.getElementById("overlayText")

    if (overlayTitle) {
      overlayTitle.textContent = title
    }
    if (overlayText) {
      overlayText.innerHTML = text.replace(/\n/g, "<br>")
    }
    if (this.overlay) {
      this.overlay.classList.remove("hidden")
    }
  }

  updateDisplay() {
    const playerScoreElem = document.getElementById("playerScore")
    const aiScoreElem = document.getElementById("aiScore")

    if (playerScoreElem) {
      playerScoreElem.textContent = this.playerScore
    }
    if (aiScoreElem) {
      aiScoreElem.textContent = this.aiScore
    }

    // Update player lives
    for (let i = 1; i <= 3; i++) {
      const life = document.getElementById(`playerLife${i}`)
      if (life) {
        if (i > this.playerLives) {
          life.classList.add("lost")
        } else {
          life.classList.remove("lost")
        }
      }
    }

    // Update AI lives
    for (let i = 1; i <= 3; i++) {
      const life = document.getElementById(`aiLife${i}`)
      if (life) {
        if (i > this.aiLives) {
          life.classList.add("lost")
        } else {
          life.classList.remove("lost")
        }
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#000"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw center line
    this.ctx.setLineDash([10, 10])
    this.ctx.strokeStyle = "#333"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(this.canvas.width / 2, 0)
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height)
    this.ctx.stroke()
    this.ctx.setLineDash([])

    // Draw paddles
    this.ctx.fillStyle = "#00ffff"
    this.ctx.fillRect(this.playerPaddle.x, this.playerPaddle.y, this.playerPaddle.width, this.playerPaddle.height)
    this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height)

    // Draw ball
    this.ctx.beginPath()
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2)
    this.ctx.fillStyle = this.speedBoostActive ? "#ffff00" : "#ffffff"
    this.ctx.fill()

    // Add glow effect for speed boost
    if (this.speedBoostActive) {
      this.ctx.shadowColor = "#ffff00"
      this.ctx.shadowBlur = 20
      this.ctx.beginPath()
      this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.shadowBlur = 0
    }

    // Draw power-up
    if (this.powerUp.active && !this.powerUp.collected) {
      this.ctx.beginPath()
      this.ctx.arc(this.powerUp.x, this.powerUp.y, this.powerUp.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = "#ffd700"
      this.ctx.fill()

      // Glow effect
      this.ctx.shadowColor = "#ffd700"
      this.ctx.shadowBlur = 15
      this.ctx.beginPath()
      this.ctx.arc(this.powerUp.x, this.powerUp.y, this.powerUp.radius, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.shadowBlur = 0

      // Draw power-up symbol
      this.ctx.fillStyle = "#000"
      this.ctx.font = "bold 16px Arial"
      this.ctx.textAlign = "center"
      this.ctx.fillText("⚡", this.powerUp.x, this.powerUp.y + 6)
    }

    // Draw speed boost indicator
    if (this.speedBoostActive) {
      this.ctx.fillStyle = "rgba(255, 255, 0, 0.8)"
      this.ctx.font = "bold 16px Courier New"
      this.ctx.textAlign = "center"
      this.ctx.fillText("SPEED BOOST!", this.canvas.width / 2, 30)
    }
  }

  gameLoop() {
    if (this.countdownActive) {
      this.updateCountdown()
    } 
    else if (this.gameRunning && !this.gamePaused) {
      this.updateAI()
      this.updateBall()
      this.updatePowerUp()
    }

    this.draw()
    requestAnimationFrame(() => this.gameLoop())
  }
}

window.addEventListener("load", () => {
  new PongGame()
})