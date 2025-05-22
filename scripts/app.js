document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio site loaded with horizontal slider")

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

  function initSlider() {
    goToSlide(currentSlide)
    paginationDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const slideIndex = Number.parseInt(dot.getAttribute("data-slide"))
        goToSlide(slideIndex)
      })
    })
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const slideIndex = Number.parseInt(link.getAttribute("data-slide"))
        goToSlide(slideIndex)
      })
    })
    ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("CTA button clicked")
        const slideIndex = Number.parseInt(button.getAttribute("data-slide"))
        goToSlide(slideIndex)
        setTimeout(() => {
          console.log("Scrolling to content after delay")
          scrollToContent()
        }, 800)
      })
    })
    slideButtons.forEach((button) => {
      if (!button.classList.contains("cta-button")) {
        button.addEventListener("click", (e) => {
          e.preventDefault()
          const slideIndex = Number.parseInt(button.getAttribute("data-slide"))
          goToSlide(slideIndex)
        })
      }
    })
    sliderTrack.addEventListener("touchstart", handleTouchStart, false)
    sliderTrack.addEventListener("touchmove", handleTouchMove, false)
    sliderTrack.addEventListener("touchend", handleTouchEnd, false)
    sliderTrack.addEventListener("mousedown", handleDragStart, false)
    document.addEventListener("mousemove", handleDragMove, false)
    document.addEventListener("mouseup", handleDragEnd, false)
    slides.forEach((slide) => {
      slide.addEventListener("scroll", handleScroll, false)
    })
    pagination.addEventListener("mouseenter", () => {
      pagination.classList.remove("fade-out")
    })
  }

  function scrollToContent() {
    const currentSlideElement = slides[currentSlide]
    const firstSection = currentSlideElement.querySelector(".resume-section, .connect-section")
    if (firstSection) {
      console.log("Found section to scroll to:", firstSection)
      const nav = document.querySelector(".sticky-nav")
      const navHeight = nav ? nav.offsetHeight : 0
      const sectionTop = firstSection.offsetTop
      currentSlideElement.scrollTo({
        top: 0,
        behavior: "smooth",
      })
      console.log("Scrolled to position:", 0)
    } else {
      console.log("No section found to scroll to")
    }
  }

  function handleScroll() {
    pagination.classList.add("fade-out")
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => {
      pagination.classList.remove("fade-out")
    }, 1500)
  }

  function goToSlide(index) {
    if (index < 0) index = 0
    if (index >= slides.length) index = slides.length - 1
    currentSlide = index
    sliderTrack.style.transform = `translateX(-${currentSlide * 33.333}%)`
    paginationDots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide)
    })
    navLinks.forEach((link, i) => {
      link.classList.toggle("active", Number.parseInt(link.getAttribute("data-slide")) === currentSlide)
    })
    if (currentSlide === 1) {
      animateSkillBars()
    }
    slides[currentSlide].scrollTop = 0
    pagination.classList.remove("fade-out")
    console.log(`Navigated to slide ${currentSlide}`)
  }

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

  function handleTouchStart(e) {
    startX = e.touches[0].clientX
  }

  function handleTouchMove(e) {
    if (!startX) return
    moveX = e.touches[0].clientX
    const diff = startX - moveX
    if (Math.abs(diff) > 5) {
      e.preventDefault()
    }
  }

  function handleTouchEnd(e) {
    if (!startX || !moveX) return
    const diff = startX - moveX
    const threshold = window.innerWidth * 0.15
    if (diff > threshold) {
      goToSlide(currentSlide + 1)
    } else if (diff < -threshold) {
      goToSlide(currentSlide - 1)
    }
    startX = null
    moveX = null
  }

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
    const threshold = window.innerWidth * 0.15
    if (diff > threshold) {
      goToSlide(currentSlide + 1)
    } else if (diff < -threshold) {
      goToSlide(currentSlide - 1)
    } else {
      goToSlide(currentSlide)
    }
    startX = null
    moveX = null
  }

  const sliderTrackElement = document.querySelector(".slider-track")
  const connectSection = document.querySelector(".connect-section")
  const contactFormContainer = document.querySelector(".contact-form-container")

  if (sliderTrackElement && connectSection && contactFormContainer) {
    contactFormContainer.style.position = "relative"
    contactFormContainer.style.zIndex = "1000"
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

  initSlider()

  const formFields = document.querySelectorAll(".form-group input, .form-group textarea")
  formFields.forEach((field) => {
    field.addEventListener("click", (e) => {
      e.stopPropagation()
    })
    field.disabled = false
  })

  const connectSlide = document.getElementById("connect-slide")
  const formInputs = connectSlide.querySelectorAll("input, textarea")
  formInputs.forEach((input) => {
    const newInput = input.cloneNode(true)
    input.parentNode.replaceChild(newInput, input)
    newInput.addEventListener("click", function (e) {
      e.stopPropagation()
      this.focus()
    })
    newInput.addEventListener("focus", function (e) {
      console.log("Input focused:", this.id)
    })
  })

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
