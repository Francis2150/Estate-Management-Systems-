
  document.addEventListener('DOMContentLoaded', () => {
    // Select all form inputs and selects in desired tab order
    const focusableElements = Array.from(
      document.querySelectorAll('input, select, textarea')
    ).filter(el => !el.disabled && el.offsetParent !== null); // remove hidden/disabled

    // Organize inputs into a grid-like structure (row-column approximation)
    function getIndex(el) {
      return focusableElements.indexOf(el);
    }

    function focusByOffset(currentEl, rowOffset, colOffset) {
      const currentIndex = getIndex(currentEl);
      if (currentIndex === -1) return;

      const currentRect = currentEl.getBoundingClientRect();

      // Try to find the next element in the same row or column
      let target = null;
      let minDistance = Infinity;

      for (const el of focusableElements) {
        if (el === currentEl) continue;

        const rect = el.getBoundingClientRect();

        // Horizontal (←/→)
        if (rowOffset === 0) {
          const sameRow = Math.abs(rect.top - currentRect.top) < 20;
          const direction = colOffset > 0 ? rect.left > currentRect.left : rect.left < currentRect.left;

          if (sameRow && direction) {
            const distance = Math.abs(rect.left - currentRect.left);
            if (distance < minDistance) {
              minDistance = distance;
              target = el;
            }
          }
        }

        // Vertical (↑/↓)
        if (colOffset === 0) {
          const sameCol = Math.abs(rect.left - currentRect.left) < 50;
          const direction = rowOffset > 0 ? rect.top > currentRect.top : rect.top < currentRect.top;

          if (sameCol && direction) {
            const distance = Math.abs(rect.top - currentRect.top);
            if (distance < minDistance) {
              minDistance = distance;
              target = el;
            }
          }
        }
      }

      if (target) {
        target.focus();
      }
    }

    // Add keydown handler to each element
    focusableElements.forEach(el => {
      el.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            focusByOffset(el, 0, 1);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            focusByOffset(el, 0, -1);
            break;
          case 'ArrowDown':
          case 'Enter':
            e.preventDefault();
            focusByOffset(el, 1, 0);
            break;
          case 'ArrowUp':
            e.preventDefault();
            focusByOffset(el, -1, 0);
            break;
          default:
            // Let Tab/Shift+Tab and others work as expected
            break;
        }
      });
    });
  });

