/***********************************************
 * 📅 AUTO-FILL TODAY’S DATE IN DATE FIELD
 ***********************************************/
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('disburseDate').value = today;
});


/***********************************************
 * 💰 SIMPLE CURRENCY FORMATTING ON INPUT/BLUR
 ***********************************************/
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[data-type="currency"]').forEach(input => {
    input.addEventListener('input', formatCurrencySimple);
    input.addEventListener('blur', formatCurrencySimple);
  });

  function formatCurrencySimple(e) {
    let input = e.target;
    let input_val = input.value;
    if (input_val === "") return;

    let original_len = input_val.length;
    let caret_pos = input.selectionStart;

    if (input_val.indexOf(".") >= 0) {
      let decimal_pos = input_val.indexOf(".");
      let left_side = formatNumber(input_val.substring(0, decimal_pos));
      let right_side = formatNumber(input_val.substring(decimal_pos));
      right_side = right_side.substring(0, 2);
      input_val = left_side + "." + right_side;
    } else {
      input_val = formatNumber(input_val);
    }

    input.value = input_val;
    input.setSelectionRange(caret_pos, caret_pos);
  }

  function formatNumber(n) {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
});




 document.addEventListener('DOMContentLoaded', () => {
      function formatCurrencyValue(value) {
        if (!value) return "0.00";

        value = value.toString().replace(/,/g, "").replace(/[^\d.]/g, "");

        let parts = value.split(".");
        let integerPart = parts[0];
        let decimalPart = parts[1] || "";

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        decimalPart = decimalPart.substring(0, 2);
        if (decimalPart.length === 1) decimalPart += "0";
        if (decimalPart.length === 0) decimalPart = "00";

        return `${integerPart}.${decimalPart}`;
      }

      // Format display-only elements
      document.querySelectorAll('[data-display="currency"]').forEach(el => {
        const raw = el.textContent || el.innerText;
        el.textContent = formatCurrencyValue(raw);
      });
    });










/***********************************************
 * 💵 ADVANCED FORMATTING WITH "₵" AND DECIMALS
 ***********************************************/
// function formatCurrencyAdvanced(input, blur) {
//   let input_val = input.value;
//   if (!input_val) return;

//   const original_len = input_val.length;
//   let caret_pos = input.selectionStart;

//   if (input_val.indexOf(".") >= 0) {
//     let [left_side, right_side] = input_val.split(".");

//     left_side = formatNumber(left_side);
//     right_side = formatNumber(right_side);

//     if (blur) {
//       right_side = right_side.padEnd(2, "0");
//     }

//     input_val = "₵" + left_side + "." + right_side.slice(0, 2);
//   } else {
//     input_val = "₵" + formatNumber(input_val);
//     if (blur) {
//       input_val += ".00";
//     }
//   }

//   input.value = input_val;

//   const updated_len = input_val.length;
//   caret_pos = updated_len - original_len + caret_pos;
//   input.setSelectionRange(caret_pos, caret_pos);
// }

// // Reusable helper function to format number with commas
// function formatNumber(n) {
//   return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }

/***********************************************
 * 🔁 APPLY ADVANCED CURRENCY FORMAT EVENTS
 ***********************************************/
// document.addEventListener("DOMContentLoaded", function () {
//   const currencyInputs = document.querySelectorAll('input[data-type="currency"]');

//   currencyInputs.forEach((input) => {
//     input.addEventListener("keyup", function () {
//       formatCurrencyAdvanced(this);
//     });

//     input.addEventListener("blur", function () {
//       formatCurrencyAdvanced(this, true);
//     });
//   });
// });
