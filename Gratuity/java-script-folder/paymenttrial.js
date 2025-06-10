// Required modules
const fs = require('fs'); // File system module to read/write CSV file
const path = require('path'); // Path module for handling file paths
const os = require('os'); // OS module to get user's home directory

// Formats a number as currency (e.g., 1200.5 → "1,200.50")
function formatCurrencyValue(value) {
  if (value == null || value === "") return "0.00";
  value = value.toString().replace(/,/g, "").replace(/[^\d.]/g, ""); // Remove commas and non-digit chars

  let parts = value.split(".");
  let integerPart = parts[0];
  let decimalPart = parts[1] || "";

  // Format integer part with commas
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  decimalPart = decimalPart.substring(0, 2);
  if (decimalPart.length === 1) decimalPart += "0";
  if (decimalPart.length === 0) decimalPart = "00";

  return `${integerPart}.${decimalPart}`;
}

// Paths to data folder and CSV file
const dataFolder = path.join(os.homedir(), 'MyAppDataTwo');
const dataFile = path.join(dataFolder, 'GRATUITY.csv');

// DOM elements
const form = document.getElementById('paymentForm');
const searchIDInput = document.getElementById('pensionId');
const pensionerDetailsDiv = document.getElementById('pensioneerDetails');
const pensioneerName = document.getElementById('pensioneerName');
const amountAwarded = document.getElementById('amountAwarded');
const totalDisbursedDisplay = document.getElementById('totalDisbursed');
const balanceDisplay = document.getElementById('balance');
const status = document.getElementById('searchStatus');
const result = document.getElementById('result');
const adminFeeAmount = document.getElementById('adminFeeAmount');
const adminFeeRateInput = document.getElementById('adminFeeRate');
const EstateTypeInput = document.getElementById('estateType');

// State variables
let Record = null; // Holds current record found
let isFirstDisbursement = false; // Flags if this is the first disbursement

// Check if CSV file exists
if (!fs.existsSync(dataFile)) {
  result.textContent = "Appropriate folders and files have not been created yet.";
}

// Debounce utility to limit how often search runs
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Searches for pensioner by ID
function searchPensioner() {
  const pensionID = searchIDInput.value.trim();

  if (!pensionID) {
    // Clear UI if search box is empty
    status.textContent = "";
    adminFeeAmount.textContent = "";
    pensionerDetailsDiv.style.display = 'none';
    Record = null;
    return;
  }

  // Read and parse CSV
  const content = fs.readFileSync(dataFile, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  Record = null;
  isFirstDisbursement = false;

  // Search for pension ID
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row[0] === pensionID) {
      const totalDisbursed = parseFloat(row[209]) || 0;

      // Create record object
      Record = {
        id: row[0],
        name: row[1],
        originalAmount: parseFloat(row[2]),
        totalDisbursed,
        balance: parseFloat(row[2]) - totalDisbursed,
        workPlace: row[3],
        date: row[4],
        lineIndex: i,
        rowData: row
      };

      // Check if first disbursement (columns 6-25 empty)
      isFirstDisbursement = row.slice(6, 26).every(cell => cell.trim() === '');
      break;
    }
  }

  if (!Record) {
    // No match found
    status.textContent = "No record found.";
    pensionerDetailsDiv.style.display = 'none';
  } else {
    // Display found record
    status.textContent = "Record found.";
    pensioneerName.textContent = ` ${Record.name}`;
    amountAwarded.textContent = formatCurrencyValue(Record.originalAmount);
    totalDisbursedDisplay.textContent = formatCurrencyValue(Record.totalDisbursed);
    balanceDisplay.textContent = formatCurrencyValue(Record.balance);
    pensionerDetailsDiv.style.display = 'block';

    // Calculate admin fee based on selected rate
    calculateAdminFee();
  }
}

// Calculates admin fee based on percentage and estate type
function calculateAdminFee() {
  if (!Record) return;

  let rate = parseFloat(adminFeeRateInput.value);
  const estateType = EstateTypeInput.value.trim().toUpperCase();

  // Excluded types where no admin fee should be applied
  const excludedTypes = ["RETAINED PORTION RELEASED", "OVER PAYMENT", "REFUND"];

  if (excludedTypes.includes(estateType)) {
    adminFeeAmount.textContent = formatCurrencyValue(0);
    return;
  }

  if (isNaN(rate)) rate = 0;

  // Compute fee as % of original award
  let fee = Record.originalAmount * (rate / 100);
  fee = Math.round(fee * 100) / 100;

  adminFeeAmount.textContent = formatCurrencyValue(fee);
}

// Event listeners
searchIDInput.addEventListener('input', debounce(searchPensioner, 300));
adminFeeRateInput.addEventListener('change', calculateAdminFee);
EstateTypeInput.addEventListener('change', calculateAdminFee);

// Form submission handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!Record) {
    result.textContent = "Please search and select a pensioner first.";
    return;
  }

  const disburseDate = document.getElementById('disburseDate').value;
  const pvNo = document.getElementById('pvNo').value.trim();
  const judicialFee = parseFloat(document.getElementById('judicialServiceFee').value.replace(/,/g, '')) || 0;
  const adminFee = parseFloat(document.getElementById('adminFeeAmount').textContent.replace(/,/g, '')) || 0;

  // Ensure required fields are provided
  if (!disburseDate || !pvNo) {
    result.textContent = "Please enter both the PV No and disbursement date.";
    return;
  }

  // Gather cheque data
  const chequeData = [];
  let chequeTotal = 0;

  for (let i = 1; i <= 9; i++) {
    const nameInput = document.getElementById(`chequeName${i}`);
    const amountInput = document.getElementById(`chequeAmount${i}`);
    const name = nameInput?.value.trim() || "";
    let amountRaw = amountInput?.value.replace(/,/g, '') || "";
    const amount = parseFloat(amountRaw) || 0;

    chequeData.push(name); // Push name
    chequeData.push(amount > 0 ? amount.toFixed(2) : ""); // Push amount or empty
    chequeTotal += amount;
  }

  if (chequeTotal === 0) {
    result.textContent = "Please enter at least one cheque amount.";
    return;
  }

  const totalDisbursedAmount = chequeTotal + judicialFee + adminFee;
  const newTotalDisbursed = Record.totalDisbursed + totalDisbursedAmount;
  const newBalance = (Record.originalAmount - newTotalDisbursed).toFixed(2);

  if (newTotalDisbursed > Record.originalAmount) {
    result.textContent = "Disbursement exceeds original amount.";
    return;
  }

  // Update record line in CSV
  const content = fs.readFileSync(dataFile, 'utf-8');
  const lines = content.trim().split('\n');
  const recordLine = lines[Record.lineIndex].split(',');

  // Find the next empty disbursement slot
  let disbursementCount = 0;
  for (let i = 6; i < 206; i += 20) {
    if (recordLine[i]?.trim()) disbursementCount++;
    else break;
  }

  const newStartIndex = 6 + disbursementCount * 20;

  if (newStartIndex + 20 > 205) {
    result.textContent = "Maximum number of disbursements reached.";
    return;
  }

  // Fill new disbursement fields
  recordLine[newStartIndex] = pvNo;
  recordLine[newStartIndex + 1] = disburseDate;

  for (let i = 0; i < 18; i++) {
    recordLine[newStartIndex + 2 + i] = chequeData[i] || "";
  }

  // Update summary fields
  recordLine[206] = (parseFloat(recordLine[206] || 0) + chequeTotal).toFixed(2); // Cheque total
  recordLine[207] = (parseFloat(recordLine[207] || 0) + judicialFee).toFixed(2); // Judicial fee
  recordLine[208] = (parseFloat(recordLine[208] || 0) + adminFee).toFixed(2); // Admin fee
  recordLine[209] = newTotalDisbursed.toFixed(2); // Total disbursed
  recordLine[210] = newBalance; // Balance

  // Save updates back to file
  lines[Record.lineIndex] = recordLine.join(',');
  fs.writeFileSync(dataFile, lines.join('\n'));

  result.textContent = `Disbursement successful. New balance: ${formatCurrencyValue(newBalance)}`;

  // Reset form and hide details
  form.reset();
  pensionerDetailsDiv.style.display = 'none';
});
