/***********************************************
 * 🧾 FORM SUBMISSION WITH PAIR VALIDATION
 ***********************************************/
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent actual form submission

  const form = document.getElementById('entryForm');

  // ✅ Correct IDs matching HTML
  const chequePairs = [
    ['chequeName1', 'chequeAmount1'],
    ['chequeName2', 'chequeAmount2'],
    ['chequeName3', 'chequeAmount3'],
    ['chequeName4', 'chequeAmount4'],
    ['chequeName5', 'chequeAmount5'],
    ['chequeName6', 'chequeAmount6'],
    ['chequeName7', 'chequeAmount7'],
    ['retainendDetails', 'retainedAmount']
  ];

  let isValid = true;

  // 🔄 Clear previous field errors
  document.querySelectorAll('.field-error').forEach(el => el.remove());

  // 🧽 Remove 'required' attributes from cheque fields
  chequePairs.forEach(([nameId, amountId]) => {
    const nameField = document.getElementById(nameId);
    const amountField = document.getElementById(amountId);
    if (nameField) nameField.removeAttribute('required');
    if (amountField) amountField.removeAttribute('required');
  });

  // 🧠 Validate name-amount pairs
  chequePairs.forEach(([nameId, amountId]) => {
    const nameField = document.getElementById(nameId);
    const amountField = document.getElementById(amountId);

    // If either field is missing, skip (avoid crashing)
    if (!nameField || !amountField) return;

    const nameFilled = nameField.value.trim() !== "";
    const amountFilled = amountField.value.trim() !== "";

    if ((nameFilled && !amountFilled) || (!nameFilled && amountFilled)) {
      isValid = false;

      if (!nameFilled) {
        showFieldError(nameField, "Cheque name is required when amount is filled.");
      }

      if (!amountFilled) {
        showFieldError(amountField, "Cheque amount is required when name is filled.");
      }
    }
  });

  // 🛡️ Native browser form validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // 💾 If everything passes, proceed with save
  if (isValid) {
    addRow();
  }

  return false; // Still prevent form reload
}

/***********************************************
 * ❌ DISPLAY FIELD-LEVEL ERROR MESSAGES
 ***********************************************/
function showFieldError(field, message) {
  const error = document.createElement('div');
  error.className = 'field-error';
  error.style.color = 'red';
  error.style.fontSize = '12px';
  error.textContent = message;

  // Prevent duplicate errors
  const existing = field.parentNode.querySelector('.field-error');
  if (!existing) {
    field.parentNode.appendChild(error);
  }
}
