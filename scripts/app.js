(() => {
  "use strict";

  const codeSnippets = [
    'Full-Stack & React Engineer',
    'Building modern web applications.'
  ];

  let currentSnippetIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const typingSpeed = 55;
  const deletingSpeed = 25;
  const pauseBeforeDelete = 1800;
  const pauseBeforeType = 300;

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

  if (heroSection) {
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
      let isDel = false;
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

        if (!isDel && charIndex < snippet.code.length) {
          element.textContent = snippet.code.substring(0, charIndex + 1);
          charIndex++;
          setTimeout(typeMatrix, speed);
        } else if (isDel && charIndex > 0) {
          element.textContent = snippet.code.substring(0, charIndex - 1);
          charIndex--;
          setTimeout(typeMatrix, speed / 2);
        } else if (!isDel && charIndex === snippet.code.length) {
          isDel = true;
          setTimeout(typeMatrix, pauseTime);
        } else if (isDel && charIndex === 0) {
          isDel = false;
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
  }

  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const nav = document.getElementById('main-nav');
      if (nav) {
        window.scrollTo({
          top: nav.offsetTop,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    });
  }

  const stickyNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.sticky-nav .nav-link');
  const sections = document.querySelectorAll('.section');

  function updateActiveNav() {
    const navH = stickyNav ? stickyNav.offsetHeight : 0;
    let currentId = '';

    sections.forEach(section => {
      const top = section.offsetTop - navH - 20;
      if (window.scrollY >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });

    // Nav shadow
    if (stickyNav) {
      stickyNav.classList.toggle('scrolled', window.scrollY > 100);
    }

    // Scroll indicator fade
    if (scrollIndicator) {
      scrollIndicator.style.opacity = window.scrollY > 100 ? '0' : '1';
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target && stickyNav) {
        window.scrollTo({
          top: target.offsetTop - stickyNav.offsetHeight,
          behavior: 'smooth'
        });
      }
    });
  });

  const fadeEls = document.querySelectorAll('.section');
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in', 'visible');
      }
    });
  }, { threshold: 0.08 });

  fadeEls.forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
  });

  const emailCard = document.getElementById('email-reveal');
  if (emailCard) {
    const email = ['hansgamlien', '@', 'gmail.com'].join('');
    let revealed = false;

    emailCard.addEventListener('click', () => {
      if (!revealed) {
        emailCard.classList.add('revealed');
        emailCard.querySelector('span').textContent = email;
        revealed = true;
      }
      navigator.clipboard.writeText(email).then(() => {
        const toast = document.createElement('div');
        toast.className = 'email-copied-toast show';
        toast.textContent = 'Email copied to clipboard';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }, 1800);
      });
    });
  }

})();
