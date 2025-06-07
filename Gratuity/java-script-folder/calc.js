
function calculateDistribution() {
  // Helper to parse currency values safely
  const parseCurrency = (id) =>
    parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;

  const principal = parseCurrency('principal');
  const adminFees = parseCurrency('adminFees');
  const judicialService = parseCurrency('judicialservice');
  const legalExpenses = parseCurrency('legalExpenses');
  const educationalFund = parseCurrency('educationalFund');

  const numberOfChildren = parseInt(document.getElementById('NumberOfChildren').value) || 1;

  // Helper to parse fractions like "1/3"
  function parsePortion(value) {
    value = value.trim();
    if (value.includes('/')) {
      const [num, denom] = value.split('/');
      if (!isNaN(num) && !isNaN(denom) && parseFloat(denom) !== 0) {
        return parseFloat(num) / parseFloat(denom);
      }
      return 0;
    }
    return parseFloat(value) || 0;
  }

  const childPortion = parsePortion(document.getElementById('childrenPortion').value);
  const spousePortion = parsePortion(document.getElementById('SpousePortion').value);
  const parentPortion = parsePortion(document.getElementById('ParentPortion').value);
  const customaryLaw = parsePortion(document.getElementById('CustomaryLaw').value);

  const totalPortions = childPortion + spousePortion + parentPortion + customaryLaw;

  // Validation
  if (totalPortions !== 1) {
    alert("Check Lawyer's Instructions on Fractions. Total must be 1.");
    return;
  }

  if (numberOfChildren < 1) {
    alert('Number of children must be at least 1.');
    return;
  }

  // Calculations
  const administrativeFees = principal * (adminFees / 100);
  const judicialFees = principal * (judicialService / 100);
  const totalFees = administrativeFees + judicialFees;
  const balance = principal - totalFees;
  const netBalance = balance - legalExpenses - educationalFund;

  const childrenShare = childPortion * netBalance;
  const spouseShare = spousePortion * netBalance;
  const parentShare = parentPortion * netBalance;
  const customaryLawShare = customaryLaw * netBalance;
  const eachChildShare = childrenShare / numberOfChildren;

  // Display results
  document.getElementById('outputContainer').style.display = "block";
  document.getElementById('adminFeeOutput').textContent = administrativeFees.toFixed(2);
  document.getElementById('judicialServiceOutput').textContent = judicialFees.toFixed(2);
  document.getElementById('totalFeesOutput').textContent = totalFees.toFixed(2);
  document.getElementById('balanceOutput').textContent = balance.toFixed(2);
  document.getElementById('educationalFundPortionOutput').textContent = educationalFund.toFixed(2);
  document.getElementById('legalExpensesOutput').textContent = legalExpenses.toFixed(2);
  document.getElementById('netbalanceOutput').textContent = netBalance.toFixed(2);
  document.getElementById('childrenPortionOutput').textContent = childrenShare.toFixed(2);
  document.getElementById('spousePortionOutput').textContent = spouseShare.toFixed(2);
  document.getElementById('parentPortionOutput').textContent = parentShare.toFixed(2);
  document.getElementById('customaryLawOutput').textContent = customaryLawShare.toFixed(2);
  document.getElementById('eachChildPortionOutput').textContent = eachChildShare.toFixed(2);
}

// 💰 Currency formatting on blur only (to avoid caret issues)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[data-type="currency"]').forEach(input => {
    input.addEventListener('blur', formatCurrencySimple);
  });

  function formatCurrencySimple(e) {
    let input = e.target;
    let input_val = input.value;
    if (input_val === "") return;

    if (input_val.indexOf(".") >= 0) {
      let decimal_pos = input_val.indexOf(".");
      let left_side = formatNumber(input_val.substring(0, decimal_pos));
      let right_side = formatNumber(input_val.substring(decimal_pos)).substring(0, 2);
      input_val = left_side + "." + right_side;
    } else {
      input_val = formatNumber(input_val);
    }

    input.value = input_val;
  }

  function formatNumber(n) {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
});

