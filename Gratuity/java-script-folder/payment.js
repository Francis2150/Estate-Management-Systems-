// Import required Node.js modules
const fs = require('fs');
const path = require('path');
const os = require('os');

// Utility function to format numbers as currency strings with commas and 2 decimals
function formatCurrencyValue(value) {
  if (value == null || value === "") return "0.00";
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

// Get references to HTML elements
const form = document.getElementById('paymentForm');
const searchIDInput = document.getElementById('pensionId');
const pensionerDetailsDiv = document.getElementById('pensioneerDetails');
const pensioneerName = document.getElementById('pensioneerName');
const amountAwarded = document.getElementById('amountAwarded');

const totalDisbursed = document.getElementById('totalDisbursed');
const balance = document.getElementById('balance');

const status = document.getElementById('searchStatus');
const result = document.getElementById('result');

const adminFeeAmount = document.getElementById('adminFeeAmount');
const adminFeeRateInput = document.getElementById('adminFeeRate');

// Define path to the GRATUITY.csv file stored in user's home directory
const dataFolder = path.join(os.homedir(), 'MyAppDataTwo');
const dataFile = path.join(dataFolder, 'GRATUITY.csv');

// Check if the data file exists, and display message if not
if (!fs.existsSync(dataFile)) {
  result.textContent = "Appropriate folders and files have not been created yet.";
}

// Initialize global variables
let Record = null;           // Will hold matched pensioner's data
let isFirstDisbursement = false; // Flag to check if it's their first disbursement

// Debounce helper function to limit how often the search runs
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Function to search pensioner by ID and update UI
function searchPensioner() {
  const pensionID = searchIDInput.value.trim();

  if (!pensionID) {
    status.textContent = "";
    adminFeeAmount.textContent = "";  // reset admin fee display
    pensionerDetailsDiv.style.display = 'none';
    Record = null;
    return;
  }

  // Read the CSV file and split into lines and headers
  const content = fs.readFileSync(dataFile, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  Record = null;
  isFirstDisbursement = false;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');

    if (row[0] === pensionID) {
      Record = {
        id: row[0],
        name: row[1],
        originalAmount: parseFloat(row[2]),
        totalDisbursed: parseFloat(row[149]) || 0,
        balance: parseFloat(row[2]) - (parseFloat(row[149]) || 0),
        workPlace: row[3],
        date: row[4],
        lineIndex: i,
        rowData: row
      };

      isFirstDisbursement = row.slice(6, 26).every(cell => cell.trim() === '');
      break;
    }
  }

  if (!Record) {
    status.textContent = "No record found.";
    pensionerDetailsDiv.style.display = 'none';
  } else {
    status.textContent = "Record found.";
    pensioneerName.textContent = ` ${Record.name}`;
    amountAwarded.textContent = formatCurrencyValue(Record.originalAmount);
    totalDisbursed.textContent = formatCurrencyValue(Record.totalDisbursed);
    balance.textContent = formatCurrencyValue(Record.balance);
    pensionerDetailsDiv.style.display = 'block';

    calculateAdminFee();  // update the admin fee for the new Record
  }
}

// Event listener for admin fee rate input change
adminFeeRateInput.addEventListener('change', calculateAdminFee);

function calculateAdminFee() {
  if (!Record) return;

  let rate = parseFloat(adminFeeRateInput.value);
  if (isNaN(rate)) rate = 0;

  let calculatedAdminFee = Record.originalAmount * (rate / 100);
  calculatedAdminFee = Math.round(calculatedAdminFee * 100) / 100;

  adminFeeAmount.textContent = formatCurrencyValue(calculatedAdminFee);
}

// Attach debounce to input event for Pension ID input
searchIDInput.addEventListener('input', debounce(searchPensioner, 300));



