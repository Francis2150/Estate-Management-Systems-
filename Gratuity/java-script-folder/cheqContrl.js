document.addEventListener("DOMContentLoaded", () => {
  const chequePairs = document.querySelectorAll(".cheque-pair");
  const addBtn = document.getElementById("addChequeBtn");
  const removeBtn = document.getElementById("removeChequeBtn");

  let currentVisible = 2;

  // Initially hide cheque 3 to 9
  chequePairs.forEach((pair, index) => {
    if (index >= currentVisible) pair.style.display = "none";
  });

  addBtn.addEventListener("click", () => {
    if (currentVisible < chequePairs.length) {
      chequePairs[currentVisible].style.display = "flex";
      currentVisible++;

      if (currentVisible === chequePairs.length) {
        addBtn.disabled = true;
      }

      removeBtn.disabled = false;
    }
  });

  removeBtn.addEventListener("click", () => {
    if (currentVisible > 2) {
      currentVisible--;
      chequePairs[currentVisible].style.display = "none";

      if (currentVisible === 2) {
        removeBtn.disabled = true;
      }

      addBtn.disabled = false;
    }
  });

  // Disable "Remove" at start
  removeBtn.disabled = true;
});
