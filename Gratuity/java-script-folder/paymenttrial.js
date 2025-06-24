const fs = require('fs');
const path = require('path');
const os = require('os');

// Format number as currency
function formatCurrencyValue(value) {
  if (value == null || value === "") return "0.00";
  value = value.toString().replace(/,/g, "").replace(/[^\d.]/g, "");
  let parts = value.split(".");
  let integerPart = parts[0];
  let decimalPart = parts[1] || "";
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  decimalPart = decimalPart.padEnd(2, "0").substring(0, 2);
  return `${integerPart}.${decimalPart}`;
}

// CSV file paths
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
const liveBalanceDisplay = document.getElementById('liveBalance');
const LiveBalancelable = document.getElementById('LiveBalancelable');

// Payment Voucher elements
const TpvNo = document.getElementById('TpvNo');
const TdisburseDate = document.getElementById('TdisburseDate');
const narrtion = document.getElementById('narrtion');
const PVamountAwarded = document.getElementById('PVamountAwarded');
const downAmount = document.getElementById('downAmount');
const downDate = document.getElementById('downDate');
// const PvcheckedBy = document.getElementById('PvcheckedBy'); // Optional: use if needed

// Column index constants
const TOTAL_CHEQUE_INDEX = 206;
const TOTAL_JUDICIAL_INDEX = 207;
const TOTAL_ADMIN_INDEX = 208;
const TOTAL_DISBURSED_INDEX = 209;
const BALANCE_INDEX = 210;

let Record = null;
let isFirstDisbursement = false;

// Debounce for search
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Overlay error
function showErrorOverlay() {
  const overlay = document.getElementById('overlayError');
  if (overlay) {
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400);
  }
}

// Search function
function searchPensioner() {
  const pensionID = searchIDInput.value.trim();
  if (!pensionID) {
    status.textContent = "";
    adminFeeAmount.textContent = "";
    LiveBalancelable.textContent = "Live Balance:";
    liveBalanceDisplay.textContent = "0.00";
    pensionerDetailsDiv.style.display = 'none';
    Record = null;
    return;
  }

  const content = fs.readFileSync(dataFile, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  Record = null;
  isFirstDisbursement = false;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row[0] === pensionID) {
      const totalDisbursed = parseFloat(row[TOTAL_DISBURSED_INDEX]) || 0;
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
      isFirstDisbursement = row.slice(6, 26).every(cell => cell.trim() === '');
      break;
    }
  }

  if (!Record) {
    status.textContent = "No record found.";
    adminFeeAmount.textContent = "0.00";
    liveBalanceDisplay.textContent = "0.00";
    pensionerDetailsDiv.style.display = 'none';
  } else {
    status.textContent = "Record found successfully.";
    pensioneerName.textContent = ` ${Record.name}`;
    amountAwarded.textContent = formatCurrencyValue(Record.originalAmount);
    totalDisbursedDisplay.textContent = formatCurrencyValue(Record.totalDisbursed);
    balanceDisplay.textContent = formatCurrencyValue(Record.balance);
    pensionerDetailsDiv.style.display = 'block';
    calculateAdminFee();
    updateLiveBalance();
  }
}

function calculateAdminFee() {
  if (!Record) return;
  let rate = parseFloat(adminFeeRateInput.value);
  const estateType = EstateTypeInput.value.trim().toUpperCase();
  const excludedTypes = ["RETAINED PORTION RELEASED", "OVER PAYMENT", "REFUND"];
  if (excludedTypes.includes(estateType)) {
    adminFeeAmount.textContent = formatCurrencyValue(0);
    return;
  }
  if (isNaN(rate)) rate = 0;
  let fee = Record.originalAmount * (rate / 100);
  fee = Math.round(fee * 100) / 100;
  adminFeeAmount.textContent = formatCurrencyValue(fee);
}

function updateLiveBalance() {
  if (!Record) return;
  let judicialFee = parseFloat(document.getElementById('judicialServiceFee').value.replace(/,/g, '')) || 0;
  let adminFee = parseFloat(adminFeeAmount.textContent.replace(/,/g, '')) || 0;
  let chequeTotal = 0;

  for (let i = 1; i <= 9; i++) {
    const amountInput = document.getElementById(`chequeAmount${i}`);
    if (amountInput) {
      let amount = parseFloat(amountInput.value.replace(/,/g, '')) || 0;
      chequeTotal += amount;
    }
  }

  const potentialDisbursement = chequeTotal + judicialFee + adminFee;
  const updatedBalance = Record.balance - potentialDisbursement;

  const overlay = document.getElementById('overlayError');
  if (updatedBalance < 0) {
    const exceededAmount = formatCurrencyValue(Math.abs(updatedBalance));
    overlay.textContent = `❌ OVER PAYMENT BY GHS ${exceededAmount}`;
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 7000);
  }

  liveBalanceDisplay.textContent = formatCurrencyValue(updatedBalance < 0 ? 0 : updatedBalance);
  LiveBalancelable.textContent = (Record.originalAmount === updatedBalance) ? "Unclaimed:" : "Retain :";
}

// Event listeners
searchIDInput.addEventListener('input', debounce(searchPensioner, 300));
document.getElementById('judicialServiceFee').addEventListener('input', updateLiveBalance);
adminFeeRateInput.addEventListener('input', () => {
  calculateAdminFee();
  updateLiveBalance();
});
EstateTypeInput.addEventListener('input', () => {
  calculateAdminFee();
  updateLiveBalance();
});
for (let i = 1; i <= 9; i++) {
  const amountInput = document.getElementById(`chequeAmount${i}`);
  if (amountInput) {
    amountInput.addEventListener('input', updateLiveBalance);
  }
}

// Placeholder: batch processing variables
let currentBatch = [];
let batchLimit = 0;
let batchCount = 0;

document.getElementById('startBatchBtn').addEventListener('click', () => {
  batchLimit = parseInt(document.getElementById('batchCount').value) || 0;
  if (batchLimit <= 0) {
    document.getElementById('batchStatus').textContent = "Invalid batch size.";
    return;
  }
  currentBatch = [];
  batchCount = 0;
  document.getElementById('batchStatus').textContent = `Batch started for ${batchLimit} pensioners.`;
});

// Modal close buttons (add your own buttons in HTML)
document.getElementById('closeModalBtn')?.addEventListener('click', () => {
  document.getElementById('confirmationModal').style.display = 'none';
});
document.getElementById('closeBatchSummaryBtn')?.addEventListener('click', () => {
  document.getElementById('batchSummary').style.display = 'none';
});
