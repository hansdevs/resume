     document.addEventListener('DOMContentLoaded', () => {
            let start = 5;
            let end = 43;
            let current = start;
            let stepTime = Math.floor(2000 / (end - start));

            let timer = setInterval(() => {
              current++;
              document.getElementById('coffeeCount').textContent = current;
              if (current >= end) clearInterval(timer);
            }, stepTime);
          });