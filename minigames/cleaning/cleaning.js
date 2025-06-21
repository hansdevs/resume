class CleaningGame {
  constructor() {
    this.room = document.getElementById("room")
    this.broom = document.getElementById("broom")
    this.lamp = document.getElementById("lamp")
    this.door = document.getElementById("door")
    this.vacuum = document.getElementById("vacuum")
    this.dustHole = document.getElementById("dust-hole")

    this.dustParticles = []
    this.dustyCreatures = []
    this.dustStacks = new Map()
    this.hiddenDusties = 0
    this.isLampOn = true
    this.isLampLost = false
    this.isBroomBroken = false
    this.isDoorOpen = false
    this.isHoleSpawned = false
    this.broomDurability = 300 // Increased durability
    this.maxDurability = 300
    this.dangerZones = [] // Track areas of danger to spread panic

    this.dustSymbols = ["·", "•", "∘"]
    this.corners = [
      { x: 0, y: 0, name: "top-left" },
      { x: "right", y: 0, name: "top-right" },
      { x: 0, y: "bottom", name: "bottom-left" },
      { x: "right", y: "bottom", name: "bottom-right" },
    ]

    this.init()
  }

  init() {
    this.setupBroom()
    this.setupVacuum()
    this.setupLamp()
    this.setupDoor()
    this.createDurabilityIndicator()
    this.startDustGeneration()

    // Place broom in center
    const roomRect = this.room.getBoundingClientRect()
    this.broom.style.left = roomRect.width / 2 - 75 + "px"
    this.broom.style.top = roomRect.height / 2 - 75 + "px"

    // Initialize dust stacks
    this.corners.forEach((corner) => {
      this.dustStacks.set(corner.name, 0)
    })

    // Spawn dust hole after delay
    setTimeout(() => this.spawnDustHole(), 10000)
  }

  createDurabilityIndicator() {
    const indicator = document.createElement("div")
    indicator.className = "durability-indicator"
    indicator.innerHTML = `
      <div>Broom Durability</div>
      <div class="durability-bar">
        <div class="durability-fill" id="durability-fill"></div>
      </div>
    `
    this.room.appendChild(indicator)
    this.updateDurabilityDisplay()
  }

  updateDurabilityDisplay() {
    const fill = document.getElementById("durability-fill")
    if (fill) {
      const percentage = (this.broomDurability / this.maxDurability) * 100
      fill.style.width = percentage + "%"
    }

    // Remove visual damage indicators - keep broom image clean
    this.broom.classList.remove("damaged", "very-damaged")
  }

  setupDoor() {
    this.door.addEventListener("click", () => {
      if (this.isBroomBroken && !this.isDoorOpen) {
        this.openDoor()
      } else if (this.isBroomBroken && this.isDoorOpen) {
        this.closeDoor()
      }
    })
    this.updateDoorState()
  }

  updateDoorState() {
    if (this.isBroomBroken) {
      this.door.classList.add("clickable")
      if (this.isDoorOpen) {
        this.door.classList.add("can-close")
      }
    }
  }

  openDoor() {
    this.isDoorOpen = true
    this.door.src = "images/dooropen.png"
    this.vacuum.classList.remove("hidden")
    this.door.classList.remove("clickable")
    this.door.classList.add("can-close")
  }

  closeDoor() {
    this.isDoorOpen = false
    this.door.src = "images/door.png"
    this.vacuum.classList.add("hidden")
    this.door.classList.remove("can-close")
    this.door.classList.add("clickable")
  }

  // Simple dragging for broom
  setupBroom() {
    this.setupDragTool(this.broom, "broom")
  }

  // Fixed vacuum dragging
  setupVacuum() {
    this.setupDragTool(this.vacuum, "vacuum")

    // Add click to vacuum functionality
    this.vacuum.addEventListener("click", (e) => {
      if (!this.vacuum.classList.contains("hidden")) {
        this.vacuumSuck()
        e.stopPropagation()
      }
    })
  }

  setupDragTool(element, type) {
    let isDragging = false
    let dragStartX, dragStartY
    let elementStartX, elementStartY

    const onMouseDown = (e) => {
      if (type === "broom" && this.isBroomBroken) return
      if (type === "vacuum" && this.vacuum.classList.contains("hidden")) return

      isDragging = true

      // Get mouse position relative to room
      const roomRect = this.room.getBoundingClientRect()
      dragStartX = (e.clientX || e.touches[0].clientX) - roomRect.left
      dragStartY = (e.clientY || e.touches[0].clientY) - roomRect.top

      // Get current element position
      elementStartX = Number.parseInt(element.style.left) || 0
      elementStartY = Number.parseInt(element.style.top) || 0

      e.preventDefault()
    }

    const onMouseMove = (e) => {
      if (!isDragging) return

      // Get current mouse position relative to room
      const roomRect = this.room.getBoundingClientRect()
      const currentX = (e.clientX || e.touches[0].clientX) - roomRect.left
      const currentY = (e.clientY || e.touches[0].clientY) - roomRect.top

      // Calculate new position
      const deltaX = currentX - dragStartX
      const deltaY = currentY - dragStartY
      const newX = elementStartX + deltaX
      const newY = elementStartY + deltaY

      // Constrain to room bounds
      const maxX = this.room.clientWidth - element.offsetWidth
      const maxY = this.room.clientHeight - element.offsetHeight
      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))

      // Update position
      element.style.left = clampedX + "px"
      element.style.top = clampedY + "px"

      // Check collisions
      const centerX = clampedX + element.offsetWidth / 2
      const centerY = clampedY + element.offsetHeight / 2

      if (!this.isLampLost) {
        this.checkLampCollision(centerX, centerY, type)
      }
      this.checkDustCollision(centerX, centerY, type)
      this.checkDustyCollision(centerX, centerY)

      // Update danger zones for dusty panic behavior
      this.updateDangerZones(centerX, centerY)

      e.preventDefault()
    }

    const onMouseUp = () => {
      isDragging = false
      // Clear danger zones when not actively dragging
      this.dangerZones = []
    }

    // Mouse events
    element.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    // Touch events
    element.addEventListener("touchstart", onMouseDown)
    document.addEventListener("touchmove", onMouseMove)
    document.addEventListener("touchend", onMouseUp)
  }

  updateDangerZones(toolX, toolY) {
    const roomRect = this.room.getBoundingClientRect()
    this.dangerZones = [
      {
        x: roomRect.left + toolX,
        y: roomRect.top + toolY,
        radius: 120,
        timestamp: Date.now(),
      },
    ]
  }

  // Only lamp has toss physics
  setupLamp() {
    let isDragging = false
    let startX, startY, lampX, lampY

    const startDrag = (e) => {
      if (this.isLampLost) return
      isDragging = true
      this.lamp.classList.add("tossable")

      const rect = this.room.getBoundingClientRect()
      startX = (e.clientX || e.touches[0].clientX) - rect.left
      startY = (e.clientY || e.touches[0].clientY) - rect.top
      lampX = Number.parseInt(this.lamp.style.left) || this.room.clientWidth - 200
      lampY = Number.parseInt(this.lamp.style.top) || 50
      e.preventDefault()
    }

    const drag = (e) => {
      if (!isDragging || this.isLampLost) return

      const rect = this.room.getBoundingClientRect()
      const currentX = (e.clientX || e.touches[0].clientX) - rect.left
      const currentY = (e.clientY || e.touches[0].clientY) - rect.top

      const newX = lampX + (currentX - startX)
      const newY = lampY + (currentY - startY)

      this.lamp.style.left = newX + "px"
      this.lamp.style.top = newY + "px"

      if (newX < -120 || newX > this.room.clientWidth + 50 || newY < -120 || newY > this.room.clientHeight + 50) {
        this.loseLamp()
      }
      e.preventDefault()
    }

    const endDrag = (e) => {
      if (!isDragging) return
      isDragging = false

      const rect = this.room.getBoundingClientRect()
      const endX = (e.clientX || e.changedTouches?.[0]?.clientX || startX) - rect.left
      const endY = (e.clientY || e.changedTouches?.[0]?.clientY || startY) - rect.top

      const velocityX = (endX - startX) * 0.1
      const velocityY = (endY - startY) * 0.1

      if (Math.abs(velocityX) > 2 || Math.abs(velocityY) > 2) {
        this.tossLamp(velocityX, velocityY)
      } else {
        this.lamp.classList.remove("tossable")
      }
    }

    this.lamp.addEventListener("mousedown", startDrag)
    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", endDrag)
    this.lamp.addEventListener("touchstart", startDrag)
    document.addEventListener("touchmove", drag)
    document.addEventListener("touchend", endDrag)
  }

  tossLamp(vx, vy) {
    let currentVx = vx
    let currentVy = vy
    const friction = 0.95
    const gravity = 0.2

    const animate = () => {
      const currentX = Number.parseInt(this.lamp.style.left) || 0
      const currentY = Number.parseInt(this.lamp.style.top) || 0

      const newX = currentX + currentVx
      const newY = currentY + currentVy

      currentVx *= friction
      currentVy = currentVy * friction + gravity

      const maxX = this.room.clientWidth - this.lamp.offsetWidth
      const maxY = this.room.clientHeight - this.lamp.offsetHeight

      if (newX <= 0 || newX >= maxX) currentVx *= -0.6
      if (newY <= 0 || newY >= maxY) currentVy *= -0.6

      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))

      this.lamp.style.left = clampedX + "px"
      this.lamp.style.top = clampedY + "px"

      if (Math.abs(currentVx) > 0.5 || Math.abs(currentVy) > 0.5) {
        requestAnimationFrame(animate)
      } else {
        this.lamp.classList.remove("tossable")
      }
    }

    requestAnimationFrame(animate)
  }

  vacuumSuck() {
    this.vacuum.classList.add("sucking")
    setTimeout(() => this.vacuum.classList.remove("sucking"), 500)

    const vacuumRect = this.vacuum.getBoundingClientRect()
    const suckRadius = 100

    // Suck up dusty creatures
    this.dustyCreatures = this.dustyCreatures.filter((dusty) => {
      const dustyRect = dusty.element.getBoundingClientRect()
      const dx = dustyRect.left + 10 - (vacuumRect.left + 60)
      const dy = dustyRect.top + 10 - (vacuumRect.top + 60)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < suckRadius) {
        dusty.element.remove()
        return false
      }
      return true
    })

    // Suck up regular dust
    this.dustParticles = this.dustParticles.filter((dust) => {
      const dustRect = dust.element.getBoundingClientRect()
      const dx = dustRect.left + 10 - (vacuumRect.left + 60)
      const dy = dustRect.top + 10 - (vacuumRect.top + 60)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < suckRadius) {
        dust.element.remove()
        return false
      }
      return true
    })
  }

  checkLampCollision(toolX, toolY, toolType) {
    if (this.isLampLost) return

    const lampRect = this.lamp.getBoundingClientRect()
    const roomRect = this.room.getBoundingClientRect()

    const lampX = lampRect.left - roomRect.left + 60
    const lampY = lampRect.top - roomRect.top + 60

    const dx = toolX - lampX
    const dy = toolY - lampY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 80) {
      this.toggleLamp()
      if (toolType === "broom") {
        this.damageBroom()
      }
    }
  }

  damageBroom() {
    this.broomDurability -= 8 + Math.random() * 5 // Reduced damage per hit
    this.updateDurabilityDisplay()

    if (this.broomDurability <= 0) {
      this.breakBroom()
    }
  }

  toggleLamp() {
    this.isLampOn = !this.isLampOn

    if (this.isLampOn) {
      this.lamp.src = "images/lampon.png"
      document.body.classList.remove("dark")
      this.room.classList.remove("dark")
    } else {
      this.lamp.src = "images/lampoff.png"
      document.body.classList.add("dark")
      this.room.classList.add("dark")
    }
  }

  // Simplified broom breaking - just image change, no visual distortion
  breakBroom() {
    this.isBroomBroken = true
    this.broom.src = "images/broombroken.png"
    this.broom.classList.add("broken")

    this.updateDoorState()

    const indicator = document.querySelector(".durability-indicator")
    if (indicator) {
      indicator.style.display = "none"
    }
  }

  loseLamp() {
    this.isLampLost = true
    this.lamp.style.display = "none"
    document.body.classList.add("dark")
    this.room.classList.add("dark")
  }

  spawnDustHole() {
    if (this.isHoleSpawned) return
    this.isHoleSpawned = true

    // Get main content area only (exclude header and footer)
    const main = document.querySelector("main")
    const mainRect = main.getBoundingClientRect()

    // Random position within main body area only, with margins
    const margin = 20
    const randomX = mainRect.left + margin + Math.random() * (mainRect.width - 60 - margin * 2)
    const randomY = mainRect.top + margin + Math.random() * (mainRect.height - 30 - margin * 2)

    this.dustHole.style.left = randomX + "px"
    this.dustHole.style.top = randomY + "px"
    this.dustHole.style.position = "fixed"
    this.dustHole.classList.remove("hidden")

    // Start spawning dusties only after hole exists
    this.startDustySpawning()
  }

  updateDustHole() {
    if (this.hiddenDusties > 0) {
      this.dustHole.src = "images/holewitheyes.png"
    } else {
      this.dustHole.src = "images/dusthole.png"
    }
  }

  startDustySpawning() {
    const spawnDusty = () => {
      if (this.isHoleSpawned) {
        this.createDustyCreature()
      }
      setTimeout(spawnDusty, 8000 + Math.random() * 10000)
    }

    setTimeout(spawnDusty, 2000)
  }

  createDustyCreature() {
    const dusty = document.createElement("img")
    dusty.src = "images/dusty.png"
    dusty.className = "dusty wandering"

    const x = Math.random() * (window.innerWidth - 20)
    const y = Math.random() * (window.innerHeight - 20)

    dusty.style.left = x + "px"
    dusty.style.top = y + "px"
    dusty.style.position = "fixed"

    document.body.appendChild(dusty)

    const dustyObj = {
      element: dusty,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      lastDuplication: Date.now(),
      isRetreating: false,
      panicLevel: 0,
    }

    this.dustyCreatures.push(dustyObj)
    this.animateDusty(dustyObj)
  }

  animateDusty(dusty) {
    const animate = () => {
      if (!dusty.element.parentNode) return

      // Check for danger zones and nearby threatened dusties
      let shouldRetreat = false
      let retreatToHoleX = 0,
        retreatToHoleY = 0

      if (this.isHoleSpawned) {
        const holeRect = this.dustHole.getBoundingClientRect()
        retreatToHoleX = holeRect.left + holeRect.width / 2
        retreatToHoleY = holeRect.top + holeRect.height / 2
      }

      // Check danger zones
      for (const danger of this.dangerZones) {
        const dx = dusty.x - danger.x
        const dy = dusty.y - danger.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < danger.radius) {
          shouldRetreat = true
          dusty.panicLevel = Math.min(dusty.panicLevel + 0.1, 1)
          break
        }
      }

      // Check if nearby dusties are retreating (colony communication)
      if (!shouldRetreat) {
        for (const otherDusty of this.dustyCreatures) {
          if (otherDusty === dusty) continue

          const dx = dusty.x - otherDusty.x
          const dy = dusty.y - otherDusty.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // If another dusty within 100px is retreating, this one panics too
          if (distance < 100 && otherDusty.isRetreating && otherDusty.panicLevel > 0.3) {
            shouldRetreat = true
            dusty.panicLevel = Math.min(dusty.panicLevel + 0.05, 0.8)
            break
          }
        }
      }

      if (shouldRetreat && this.isHoleSpawned) {
        // Retreat TO the hole, not away from tools
        const dx = retreatToHoleX - dusty.x
        const dy = retreatToHoleY - dusty.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 10) {
          const speed = 1.5 + dusty.panicLevel
          dusty.vx = (dx / distance) * speed
          dusty.vy = (dy / distance) * speed
          dusty.isRetreating = true

          // Change appearance when retreating
          dusty.element.classList.remove("wandering")
          dusty.element.classList.add("retreating")
        }
      } else {
        // Calm down and wander normally
        dusty.panicLevel = Math.max(dusty.panicLevel - 0.02, 0)
        dusty.isRetreating = false

        dusty.element.classList.remove("retreating")
        dusty.element.classList.add("wandering")

        // Normal wandering
        if (Math.random() < 0.02) {
          dusty.vx = (Math.random() - 0.5) * 0.8
          dusty.vy = (Math.random() - 0.5) * 0.8
        }
      }

      dusty.x += dusty.vx
      dusty.y += dusty.vy

      // Boundary wrapping
      if (dusty.x < -20) dusty.x = window.innerWidth
      if (dusty.x > window.innerWidth) dusty.x = -20
      if (dusty.y < -20) dusty.y = window.innerHeight
      if (dusty.y > window.innerHeight) dusty.y = -20

      dusty.element.style.left = dusty.x + "px"
      dusty.element.style.top = dusty.y + "px"

      // Create dust trails occasionally (more when panicked)
      const trailChance = dusty.isRetreating ? 0.15 : 0.05
      if (Math.random() < trailChance) {
        this.createDustTrail(dusty.x + 10, dusty.y + 10)
      }

      // Check for dust hole collision (touch-based)
      if (this.isHoleSpawned) {
        const holeRect = this.dustHole.getBoundingClientRect()
        if (
          dusty.x + 20 > holeRect.left &&
          dusty.x < holeRect.right &&
          dusty.y + 20 > holeRect.top &&
          dusty.y < holeRect.bottom
        ) {
          dusty.element.remove()
          this.hiddenDusties++
          this.updateDustHole()
          return
        }
      }

      // Duplication (less frequent when stressed)
      const duplicationChance = dusty.panicLevel > 0.5 ? 0.0001 : 0.0005
      if (Date.now() - dusty.lastDuplication > 20000 && Math.random() < duplicationChance) {
        this.duplicateDusty(dusty)
        dusty.lastDuplication = Date.now()
      }

      requestAnimationFrame(animate)
    }

    animate()
  }

  duplicateDusty(parentDusty) {
    const newDusty = document.createElement("img")
    newDusty.src = "images/dusty.png"
    newDusty.className = "dusty wandering"

    const x = parentDusty.x + (Math.random() - 0.5) * 40
    const y = parentDusty.y + (Math.random() - 0.5) * 40

    newDusty.style.left = x + "px"
    newDusty.style.top = y + "px"
    newDusty.style.position = "fixed"

    document.body.appendChild(newDusty)

    const dustyObj = {
      element: newDusty,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      lastDuplication: Date.now(),
      isRetreating: false,
      panicLevel: parentDusty.panicLevel * 0.5, // Inherit some panic
    }

    this.dustyCreatures.push(dustyObj)
    this.animateDusty(dustyObj)
  }

  createDustTrail(x, y) {
    const trail = document.createElement("div")
    trail.className = "dust-trail"
    trail.style.left = x + "px"
    trail.style.top = y + "px"
    trail.style.position = "fixed"

    document.body.appendChild(trail)

    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail)
      }
    }, 8000)
  }

  checkDustyCollision(toolX, toolY) {
    const toolRect = this.room.getBoundingClientRect()
    const absoluteToolX = toolRect.left + toolX
    const absoluteToolY = toolRect.top + toolY

    this.dustyCreatures = this.dustyCreatures.filter((dusty) => {
      const dx = dusty.x + 10 - absoluteToolX
      const dy = dusty.y + 10 - absoluteToolY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 30) {
        dusty.element.remove()
        return false
      }
      return true
    })
  }

  generateDust() {
    const dust = document.createElement("div")
    dust.className = "dust"
    dust.textContent = this.dustSymbols[Math.floor(Math.random() * this.dustSymbols.length)]

    const x = Math.random() * (this.room.clientWidth - 20)
    const y = Math.random() * (this.room.clientHeight - 20)

    dust.style.left = x + "px"
    dust.style.top = y + "px"

    this.room.appendChild(dust)
    this.dustParticles.push({
      element: dust,
      x: x + 10,
      y: y + 10,
      vx: 0,
      vy: 0,
    })
  }

  checkDustCollision(toolX, toolY, toolType = "broom") {
    const sweepRadius = 40

    this.dustParticles = this.dustParticles.filter((dust) => {
      const dx = dust.x - toolX
      const dy = dust.y - toolY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < sweepRadius) {
        if (toolType === "vacuum") {
          // Vacuum removes dust completely
          dust.element.remove()
          return false
        } else {
          // Broom pushes dust around
          const pushForce = 0.3
          dust.vx = (dx / distance) * pushForce * 100
          dust.vy = (dy / distance) * pushForce * 100
          this.animateDust(dust)
          return false
        }
      }
      return true
    })
  }

  animateDust(dust) {
    const animate = () => {
      dust.x += dust.vx
      dust.y += dust.vy
      dust.vx *= 0.95
      dust.vy *= 0.95

      const roomWidth = this.room.clientWidth
      const roomHeight = this.room.clientHeight
      const cornerThreshold = 50

      let hitCorner = false

      if (dust.x <= cornerThreshold && dust.y <= cornerThreshold) {
        this.stackDustInCorner("top-left", dust)
        hitCorner = true
      } else if (dust.x >= roomWidth - cornerThreshold && dust.y <= cornerThreshold) {
        this.stackDustInCorner("top-right", dust)
        hitCorner = true
      } else if (dust.x <= cornerThreshold && dust.y >= roomHeight - cornerThreshold) {
        this.stackDustInCorner("bottom-left", dust)
        hitCorner = true
      } else if (dust.x >= roomWidth - cornerThreshold && dust.y >= roomHeight - cornerThreshold) {
        this.stackDustInCorner("bottom-right", dust)
        hitCorner = true
      }

      if (hitCorner) return

      if (dust.x <= 0 || dust.x >= roomWidth - 20) {
        dust.vx *= -0.5
        dust.x = Math.max(0, Math.min(dust.x, roomWidth - 20))
      }
      if (dust.y <= 0 || dust.y >= roomHeight - 20) {
        dust.vy *= -0.5
        dust.y = Math.max(0, Math.min(dust.y, roomHeight - 20))
      }

      dust.element.style.left = dust.x + "px"
      dust.element.style.top = dust.y + "px"

      if (Math.abs(dust.vx) > 0.1 || Math.abs(dust.vy) > 0.1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          if (dust.element.parentNode) {
            dust.element.parentNode.removeChild(dust.element)
          }
        }, 1000)
      }
    }

    animate()
  }

  stackDustInCorner(cornerName, dust) {
    const currentStack = this.dustStacks.get(cornerName)
    this.dustStacks.set(cornerName, currentStack + 1)

    if (dust.element.parentNode) {
      dust.element.parentNode.removeChild(dust.element)
    }

    this.updateCornerDustPile(cornerName)
  }

  updateCornerDustPile(cornerName) {
    const stackSize = this.dustStacks.get(cornerName)
    let pileElement = document.getElementById(`dust-pile-${cornerName}`)

    if (!pileElement && stackSize > 0) {
      pileElement = document.createElement("div")
      pileElement.id = `dust-pile-${cornerName}`
      pileElement.className = "dust stacked"
      this.room.appendChild(pileElement)
    }

    if (pileElement) {
      const corner = this.corners.find((c) => c.name === cornerName)
      let x, y

      if (corner.x === "right") {
        x = this.room.clientWidth - 30
      } else {
        x = corner.x + 10
      }

      if (corner.y === "bottom") {
        y = this.room.clientHeight - 30
      } else {
        y = corner.y + 10
      }

      pileElement.style.left = x + "px"
      pileElement.style.top = y + "px"

      const dustSymbols = ["∴", "∵", "⋯", "⋰", "⋱"]
      pileElement.textContent = dustSymbols[Math.min(stackSize - 1, dustSymbols.length - 1)]

      const size = Math.min(8 + stackSize * 2, 20)
      pileElement.style.fontSize = size + "px"
    }
  }

  startDustGeneration() {
    const generateDustInterval = () => {
      this.generateDust()
      const nextInterval = 1000 + Math.random() * 1000
      setTimeout(generateDustInterval, nextInterval)
    }

    setTimeout(generateDustInterval, 2000)

    setInterval(() => {
      if (Math.random() < 0.4) {
        const burstCount = 3 + Math.floor(Math.random() * 5)
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => this.generateDust(), i * 150)
        }
      }
    }, 8000)
  }
}

window.addEventListener("load", () => {
  new CleaningGame()
})
