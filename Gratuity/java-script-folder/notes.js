



// This script hides elements with specific classes if they are empty
    document.addEventListener("DOMContentLoaded", function() {
      const chequeNames = document.querySelectorAll('.cheque-name ,.retained,.retained-amount');
  
      chequeNames.forEach(div => {
        // Trim the textContent to ignore whitespace
        if (div.textContent.trim() === '') {
          div.style.display = 'none';
        }
      });
    });
