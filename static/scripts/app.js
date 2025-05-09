document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio site loaded")
  
    // Simple navigation - no fancy SPA behavior
    // Just make sure the scroll and animation effects work
  
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
  
    // Animate skill bars if on resume page
    if (window.location.pathname.includes("resume")) {
      const skillLevels = document.querySelectorAll(".skill-level")
      skillLevels.forEach((skill) => {
        const width = skill.style.width
        skill.style.width = "0"
        setTimeout(() => {
          skill.style.width = width
        }, 100)
      })
    }
  })
  