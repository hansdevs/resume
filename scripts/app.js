document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio site loaded with horizontal slider")

  // Slider functionality
  const sliderTrack = document.querySelector(".slider-track")
  const slides = document.querySelectorAll(".slide")
  const paginationDots = document.querySelectorAll(".pagination-dot")
  const navLinks = document.querySelectorAll(".nav-link")
  const slideButtons = document.querySelectorAll("[data-slide]")
  const pagination = document.querySelector(".pagination")
  const ctaButtons = document.querySelectorAll(".cta-button")

  let currentSlide = 0
  let startX, moveX
  let isDragging = false
  let scrollTimeout = null

  // Initialize the slider
  function initSlider() {
    // Set initial position
    goToSlide(currentSlide)

    // Add event listeners for pagination dots
    paginationDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = Number.parseInt(dot.getAttribute("data-slide"))
        goToSlide(slideIndex)
      })
    })

    // Add event listeners for navigation links
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const slideIndex = Number.parseInt(link.getAttribute("data-slide"))
        goToSlide(slideIndex)
      })
    })

    // Add event listeners specifically for CTA buttons
    ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("CTA button clicked")

        const slideIndex = Number.parseInt(button.getAttribute("data-slide"))
        goToSlide(slideIndex)

        // Add a longer delay to ensure the slide transition completes
        setTimeout(() => {
          console.log("Scrolling to content after delay")
          scrollToContent()
        }, 800)
      })
    })

    // Add event listeners for other buttons with data-slide attribute
    slideButtons.forEach((button) => {
      if (!button.classList.contains("cta-button")) {
        button.addEventListener("click", (e) => {
          e.preventDefault()
          const slideIndex = Number.parseInt(button.getAttribute("data-slide"))
          goToSlide(slideIndex)
        })
      }
    })

    // Touch events for mobile swipe
    sliderTrack.addEventListener("touchstart", handleTouchStart, false)
    sliderTrack.addEventListener("touchmove", handleTouchMove, false)
    sliderTrack.addEventListener("touchend", handleTouchEnd, false)

    // Mouse events for desktop drag
    sliderTrack.addEventListener("mousedown", handleDragStart, false)
    document.addEventListener("mousemove", handleDragMove, false)
    document.addEventListener("mouseup", handleDragEnd, false)

    // Scroll events to hide/show pagination
    slides.forEach((slide) => {
      slide.addEventListener("scroll", handleScroll, false)
    })

    // Show pagination on hover
    pagination.addEventListener("mouseenter", () => {
      pagination.classList.remove("fade-out")
    })
  }

  // Function to scroll to the content area
  function scrollToContent() {
    // Get the current slide
    const currentSlideElement = slides[currentSlide]

    // Get the first section in the current slide
    const firstSection = currentSlideElement.querySelector(".resume-section, .connect-section")

    if (firstSection) {
      console.log("Found section to scroll to:", firstSection)

      // Calculate the position to scroll to
      const nav = document.querySelector(".sticky-nav")
      const navHeight = nav ? nav.offsetHeight : 0
      const sectionTop = firstSection.offsetTop

      // Scroll the slide to the section
      currentSlideElement.scrollTo({
        top: 0,
        behavior: "smooth",
      })

      console.log("Scrolled to position:", 0)
    } else {
      console.log("No section found to scroll to")
    }
  }

  // Handle scroll events to hide/show pagination
  function handleScroll() {
    // Hide pagination when scrolling
    pagination.classList.add("fade-out")

    // Clear any existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    // Set a timeout to show pagination after scrolling stops
    scrollTimeout = setTimeout(() => {
      pagination.classList.remove("fade-out")
    }, 1500) // Show after 1.5 seconds of no scrolling
  }

  // Go to specific slide
  function goToSlide(index) {
    if (index < 0) index = 0
    if (index >= slides.length) index = slides.length - 1

    // Update current slide
    currentSlide = index

    // Move slider
    sliderTrack.style.transform = `translateX(-${currentSlide * 33.333}%)`

    // Update pagination dots
    paginationDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide)
    })

    // Update navigation links
    navLinks.forEach((link, i) => {
      link.classList.toggle("active", Number.parseInt(link.getAttribute("data-slide")) === currentSlide)
    })

    // Animate skill bars if on resume slide
    if (currentSlide === 1) {
      animateSkillBars()
    }

    // Scroll to top of the slide
    slides[currentSlide].scrollTop = 0

    // Show pagination when changing slides
    pagination.classList.remove("fade-out")

    console.log(`Navigated to slide ${currentSlide}`)
  }

  // Animate skill bars
  function animateSkillBars() {
    const skillLevels = document.querySelectorAll(".skill-level")
    skillLevels.forEach((skill) => {
      const width = skill.style.width
      skill.style.width = "0"
      setTimeout(() => {
        skill.style.width = width
      }, 100)
    })
  }

  // Touch event handlers
  function handleTouchStart(e) {
    startX = e.touches[0].clientX
  }

  function handleTouchMove(e) {
    if (!startX) return

    moveX = e.touches[0].clientX
    const diff = startX - moveX

    // Prevent default only if horizontal swipe is significant
    if (Math.abs(diff) > 5) {
      e.preventDefault()
    }
  }

  function handleTouchEnd(e) {
    if (!startX || !moveX) return

    const diff = startX - moveX
    const threshold = window.innerWidth * 0.15 // 15% of screen width

    if (diff > threshold) {
      // Swipe left, go to next slide
      goToSlide(currentSlide + 1)
    } else if (diff < -threshold) {
      // Swipe right, go to previous slide
      goToSlide(currentSlide - 1)
    }

    // Reset values
    startX = null
    moveX = null
  }

  // Mouse drag event handlers
  function handleDragStart(e) {
    isDragging = true
    startX = e.clientX
    sliderTrack.style.transition = "none"
    e.preventDefault()
  }

  function handleDragMove(e) {
    if (!isDragging) return

    moveX = e.clientX
    const diff = startX - moveX
    const currentTranslate = -currentSlide * 33.333
    const newTranslate = currentTranslate - (diff / window.innerWidth) * 33.333

    // Limit dragging to one slide at a time
    if (newTranslate <= 0 && newTranslate >= -66.666) {
      sliderTrack.style.transform = `translateX(${newTranslate}%)`
    }
  }

  function handleDragEnd(e) {
    if (!isDragging) return

    isDragging = false
    sliderTrack.style.transition = "transform 0.5s ease-in-out"

    if (!moveX) return

    const diff = startX - moveX
    const threshold = window.innerWidth * 0.15 // 15% of screen width

    if (diff > threshold) {
      // Drag left, go to next slide
      goToSlide(currentSlide + 1)
    } else if (diff < -threshold) {
      // Drag right, go to previous slide
      goToSlide(currentSlide - 1)
    } else {
      // Not enough drag, go back to current slide
      goToSlide(currentSlide)
    }

    // Reset values
    startX = null
    moveX = null
  }

  // Fix for slider-track capturing form events
  const sliderTrackElement = document.querySelector(".slider-track")
  const connectSection = document.querySelector(".connect-section")
  const contactFormContainer = document.querySelector(".contact-form-container")

  if (sliderTrackElement && connectSection && contactFormContainer) {
    // Make the form container visually stand out
    contactFormContainer.style.position = "relative"
    contactFormContainer.style.zIndex = "1000"

    // Prevent slider events from capturing form interactions
    contactFormContainer.addEventListener(
      "mousedown",
      (e) => {
        e.stopPropagation()
        console.log("Form container clicked, stopping propagation")
      },
      true,
    )

    contactFormContainer.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation()
        console.log("Form container touched, stopping propagation")
      },
      true,
    )

    // Add click handlers to each form element
    const formElements = contactFormContainer.querySelectorAll("input, textarea, button")
    formElements.forEach((element) => {
      element.addEventListener(
        "mousedown",
        function (e) {
          e.stopPropagation()
          console.log(`${this.tagName} clicked, stopping propagation`)
        },
        true,
      )

      element.addEventListener(
        "touchstart",
        function (e) {
          e.stopPropagation()
          console.log(`${this.tagName} touched, stopping propagation`)
        },
        true,
      )

      element.addEventListener(
        "click",
        function (e) {
          e.stopPropagation()
          console.log(`${this.tagName} clicked`)
          if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
            this.focus()
          }
        },
        true,
      )
    })
  }

  // Scroll indicator functionality
  const scrollIndicator = document.querySelector(".scroll-indicator")
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      const nav = document.querySelector(".sticky-nav")
      if (nav) {
        window.scrollTo({
          top: nav.offsetTop,
          behavior: "smooth",
        })
      }
    })
  }

  // Handle scroll events
  window.addEventListener("scroll", () => {
    const scrollIndicator = document.querySelector(".scroll-indicator")
    const nav = document.querySelector(".sticky-nav")

    if (window.scrollY > 100) {
      if (scrollIndicator) scrollIndicator.style.opacity = "0"
      if (nav) nav.classList.add("nav-scrolled")
    } else {
      if (scrollIndicator) scrollIndicator.style.opacity = "1"
      if (nav) nav.classList.remove("nav-scrolled")
    }
  })

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        })
      }
    })
  })

  // Initialize the slider
  initSlider()

  // Ensure form fields are properly initialized and clickable
  const formFields = document.querySelectorAll(".form-group input, .form-group textarea")
  formFields.forEach((field) => {
    field.addEventListener("click", (e) => {
      // Prevent any potential event propagation issues
      e.stopPropagation()
    })

    // Ensure the field is not disabled
    field.disabled = false
  })

  // Fix for form fields not being clickable
  const connectSlide = document.getElementById("connect-slide")
  const formInputs = connectSlide.querySelectorAll("input, textarea")

  // Make sure the form fields are clickable
  formInputs.forEach((input) => {
    // Remove any event listeners that might be blocking clicks
    const newInput = input.cloneNode(true)
    input.parentNode.replaceChild(newInput, input)

    // Add a click handler to ensure focus
    newInput.addEventListener("click", function (e) {
      e.stopPropagation()
      this.focus()
    })

    // Add a focus handler
    newInput.addEventListener("focus", function (e) {
      console.log("Input focused:", this.id)
    })
  })

  // Disable any drag functionality when clicking on form elements
  const contactFormElement = document.getElementById("contactForm")
  if (contactFormElement) {
    contactFormElement.addEventListener("mousedown", (e) => {
      e.stopPropagation()
    })

    contactFormElement.addEventListener("touchstart", (e) => {
      e.stopPropagation()
    })
  }
})
