(() => {
  "use strict";

  console.log("%c▶ app.js v19 loaded", "background:#8b5cf6;color:#fff;padding:2px 6px;border-radius:4px");
  
  const codeSnippets = [
    'print("Hi, I\'m Hans")'
  ];
  
  let currentSnippetIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const typingSpeed = 120;
  const deletingSpeed = 40;
  const pauseBeforeDelete = 5000;
  const pauseBeforeType = 500;
  
  function typeWriter() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const currentSnippet = codeSnippets[currentSnippetIndex];
    
    if (!isDeleting && currentCharIndex < currentSnippet.length) {
      typingElement.textContent = currentSnippet.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      setTimeout(typeWriter, typingSpeed);
    } else if (isDeleting && currentCharIndex > 0) {
      typingElement.textContent = currentSnippet.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      setTimeout(typeWriter, deletingSpeed);
    } else if (!isDeleting && currentCharIndex === currentSnippet.length) {
      isDeleting = true;
      setTimeout(typeWriter, pauseBeforeDelete);
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      currentSnippetIndex = (currentSnippetIndex + 1) % codeSnippets.length;
      setTimeout(typeWriter, pauseBeforeType);
    }
  }
  
  setTimeout(typeWriter, 1000);
  
  const matrixSnippets = [
    { code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]` },
    { code: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}` },
    { code: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}` },
    { code: `fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2)
    }
}` },
    { code: `const dfs = (graph, node, visited = new Set()) => {
    visited.add(node);
    for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
    return visited;
};` },
    { code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)` },
    { code: `.my-favorite-color {
    color: #8b5cf6;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}` },
    { code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Check out my startup, Cordinova :)");
    }
}` }
  ];
  
  const positions = [
    { x: 5, y: 10 },
    { x: 70, y: 15 },
    { x: 10, y: 65 },
    { x: 75, y: 70 },
    { x: 35, y: 40 },
    { x: 15, y: 85 },
    { x: 65, y: 50 },
    { x: 20, y: 30 }
  ];
  
  const currentPositions = [...positions].sort(() => Math.random() - 0.5);
  
  const heroSection = document.querySelector('.hero');
  const elements = [];
  
  matrixSnippets.forEach((snippet, index) => {
    const pos = currentPositions[index];
    const codeDiv = document.createElement('div');
    codeDiv.className = 'matrix-code';
    codeDiv.style.left = `${pos.x}%`;
    codeDiv.style.top = `${pos.y}%`;
    codeDiv.id = `matrix-code-${index}`;
    heroSection.insertBefore(codeDiv, heroSection.querySelector('.hero-overlay'));
    elements.push(codeDiv);
  });
  
  matrixSnippets.forEach((snippet, index) => {
    let charIndex = 0;
    let isDeleting = false;
    const speed = 25 + Math.random() * 20;
    const pauseTime = 3000 + Math.random() * 2000;
    const initialDelay = Math.random() * 3000;
    
    function swapPosition() {
      const otherIndex = Math.floor(Math.random() * elements.length);
      if (otherIndex === index) return;
      
      const myElement = elements[index];
      const otherElement = elements[otherIndex];
      
      const myPos = { 
        x: parseFloat(myElement.style.left), 
        y: parseFloat(myElement.style.top) 
      };
      const otherPos = { 
        x: parseFloat(otherElement.style.left), 
        y: parseFloat(otherElement.style.top) 
      };
      
      myElement.style.left = `${otherPos.x}%`;
      myElement.style.top = `${otherPos.y}%`;
      otherElement.style.left = `${myPos.x}%`;
      otherElement.style.top = `${myPos.y}%`;
    }
    
    function typeMatrix() {
      const element = document.getElementById(`matrix-code-${index}`);
      if (!element) return;
      
      if (!isDeleting && charIndex < snippet.code.length) {
        element.textContent = snippet.code.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeMatrix, speed);
      } else if (isDeleting && charIndex > 0) {
        element.textContent = snippet.code.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(typeMatrix, speed / 2);
      } else if (!isDeleting && charIndex === snippet.code.length) {
        isDeleting = true;
        setTimeout(typeMatrix, pauseTime);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        
        setTimeout(() => {
          const myElement = elements[index];
          myElement.style.opacity = '0';
          
          setTimeout(() => {
            swapPosition();
            setTimeout(() => {
              myElement.style.opacity = '1';
              setTimeout(typeMatrix, 300);
            }, 100);
          }, 500);
        }, 200);
      }
    }
    
    setTimeout(typeMatrix, initialDelay);
  });
  
  document.querySelectorAll(".invisible-spacer").forEach((el) => el.remove());
  const sliderContainer = document.querySelector(".slider-container");
  const sliderTrack = document.querySelector(".slider-track");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".pagination-dot"));
  const topNavLinks = Array.from(document.querySelectorAll(".main-nav .nav-link"));
  const footerLinks = Array.from(document.querySelectorAll("footer .footer-links a[data-slide]"));
  const heroCTAs = Array.from(document.querySelectorAll(".hero .cta-button[data-slide]"));
  const stickyNav = document.querySelector(".sticky-nav");
  const heroArrow = document.querySelector(".scroll-indicator");
  const paginationUI = document.querySelector(".pagination");
  let current = 0;
  let fadeT;
  let hRAF;
  const px = (v) => parseFloat(getComputedStyle(v).paddingTop) + parseFloat(getComputedStyle(v).paddingBottom);
  const getSlideHeight = (s) => s.scrollHeight - px(s);
  const syncHeight = () => {
    cancelAnimationFrame(hRAF);
    hRAF = requestAnimationFrame(() => {
      if (!sliderContainer) return;
      sliderContainer.style.height = `${getSlideHeight(slides[current])}px`;
    });
  };
  const RO = new ResizeObserver(syncHeight);
  const MO = new MutationObserver(syncHeight);
  const watchSlide = () => {
    RO.disconnect();
    MO.disconnect();
    const s = slides[current];
    RO.observe(s);
    MO.observe(s, { childList: true, subtree: true, attributes: true });
    s.querySelectorAll("img").forEach((img) => !img.complete && img.addEventListener("load", syncHeight, { once: true }));
    syncHeight();
  };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const sliderTop = () => sliderContainer.offsetTop;
  const navH = () => (stickyNav ? stickyNav.offsetHeight : 0);
  const inView = () => window.scrollY >= sliderTop() - navH() - 2;
  const scrollToSlider = (force = false) => {
    if (force || !inView()) {
      window.scrollTo({ top: sliderTop() - navH(), behavior: "smooth" });
    }
  };
  const animateBars = () => {
    if (current !== 1) return;
    document.querySelectorAll(".skill-level").forEach((bar) => {
      const w = bar.dataset.level || bar.style.width;
      bar.dataset.level = w;
      bar.style.width = "0";
      requestAnimationFrame(() => (bar.style.width = w));
    });
  };
  const go = (idx) => {
    current = clamp(idx, 0, slides.length - 1);
    sliderTrack.style.transition = "transform .55s ease";
    sliderTrack.style.transform = `translateX(-${current * 33.3333}%)`;
    slides[current].scrollTop = 0;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    topNavLinks.concat(footerLinks).forEach((l) => l.classList.toggle("active", +l.dataset.slide === current));
    animateBars();
    watchSlide();
  };
  const bind = (el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    go(+el.dataset.slide);
    scrollToSlider(el.closest(".hero"));
  });
  [...topNavLinks, ...footerLinks, ...heroCTAs].forEach(bind);
  dots.forEach((d, i) => d.addEventListener("click", (e) => {
    e.preventDefault();
    go(i);
    scrollToSlider();
  }));
  heroArrow && heroArrow.addEventListener("click", () => stickyNav && window.scrollTo({ top: stickyNav.offsetTop, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    if (!stickyNav) return;
    const scrolled = window.scrollY > 100;
    heroArrow && (heroArrow.style.opacity = scrolled ? "0" : "1");
    stickyNav.classList.toggle("nav-scrolled", scrolled);
  });
  let dragging = false;
  let horizDrag = false;
  let decided = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchTimeout = null;
  let lastTouchTime = 0;
  const DECISION_THRESHOLD = 15;
  const thresh = () => window.innerWidth * 0.2;
  
  const resetTouchState = () => {
    dragging = false;
    horizDrag = false;
    decided = false;
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      touchTimeout = null;
    }
    sliderTrack.style.transition = "transform .55s ease";
    sliderTrack.style.transform = `translateX(-${current * 33.3333}%)`;
  };
  
  const startTouch = (x, y) => {
    const now = Date.now();
    if (now - lastTouchTime < 100) {
      resetTouchState();
      return;
    }
    lastTouchTime = now;
    
    if (touchTimeout) clearTimeout(touchTimeout);
    touchTimeout = setTimeout(resetTouchState, 3000);
    
    dragging = true;
    decided = false;
    horizDrag = false;
    touchStartX = x;
    touchStartY = y;
  };
  const moveTouch = (x, y) => {
    if (!dragging) return;
    const dx = x - touchStartX;
    const dy = y - touchStartY;
    if (!decided) {
      if (Math.abs(dx) < DECISION_THRESHOLD && Math.abs(dy) < DECISION_THRESHOLD) return;
      horizDrag = Math.abs(dx) > Math.abs(dy) * 2;
      decided = true;
      if (!horizDrag) {
        dragging = false;
        if (touchTimeout) clearTimeout(touchTimeout);
        touchTimeout = null;
        return;
      }
      sliderTrack.style.transition = "none";
    }
    if (!horizDrag) {
      resetTouchState();
      return;
    }
    const pct = -current * 33.3333 - (dx / window.innerWidth) * 33.3333;
    if (pct <= 0 && pct >= -66.6666) sliderTrack.style.transform = `translateX(${pct}%)`;
  };
  const endTouch = (x) => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      touchTimeout = null;
    }
    
    const wasHorizDrag = horizDrag;
    const wasDragging = dragging;
    const startX = touchStartX;
    
    dragging = false;
    horizDrag = false;
    decided = false;
    sliderTrack.style.transition = "transform .55s ease";
    
    if (!wasDragging || !wasHorizDrag) {
      sliderTrack.style.transform = `translateX(-${current * 33.3333}%)`;
      return;
    }
    const diff = startX - x;
    if (diff > thresh()) go(current + 1);
    else if (diff < -thresh()) go(current - 1);
    else go(current);
  };
  
  sliderTrack.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      startTouch(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      resetTouchState();
    }
  }, { passive: true });
  sliderTrack.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 1) {
      resetTouchState();
      return;
    }
    moveTouch(e.touches[0].clientX, e.touches[0].clientY);
    if (horizDrag && decided) e.preventDefault();
  }, { passive: false });
  sliderTrack.addEventListener("touchend", (e) => {
    if (e.changedTouches.length > 0 && e.touches.length === 0) {
      endTouch(e.changedTouches[0].clientX);
    } else {
      resetTouchState();
    }
  });
  sliderTrack.addEventListener("touchcancel", resetTouchState);
  
  sliderTrack.addEventListener("mousedown", (e) => startTouch(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => moveTouch(e.clientX, e.clientY));
  window.addEventListener("mouseup", (e) => endTouch(e.clientX));
  
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) resetTouchState();
  });
  
  window.addEventListener("blur", resetTouchState);
  
  slides.forEach((s) => s.addEventListener("scroll", () => {
    if (dragging) {
      resetTouchState();
    }
    paginationUI && paginationUI.classList.add("fade-out");
    clearTimeout(fadeT);
    fadeT = setTimeout(() => paginationUI && paginationUI.classList.remove("fade-out"), 1200);
  }));
  const snakeBtn = document.getElementById("hidden-start-btn");
  const snakeWrap = document.getElementById("snake-game-wrapper");
  if (snakeBtn && snakeWrap) {
    snakeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      snakeWrap.style.display = snakeWrap.style.display === "block" ? "none" : "block";
      requestAnimationFrame(() => requestAnimationFrame(syncHeight));
    });
  }
  window.addEventListener("resize", syncHeight);
  go(0);
  
  window.revealEmail = function() {
    const emailReveal = document.getElementById("email-reveal");
    const emailText = document.getElementById("email-text");
    if (emailReveal && !emailReveal.classList.contains('show')) {
      emailReveal.classList.add('show');
      setTimeout(() => {
        if (emailText) {
          emailText.select();
          emailText.setSelectionRange(0, 99999);
          navigator.clipboard.writeText(emailText.value);
        }
      }, 400);
    }
  };
})();
