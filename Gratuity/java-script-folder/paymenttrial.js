// ===========================
// MODULE IMPORTS
// ===========================
const fs = require('fs'); // Node.js File System module for reading/writing CSV
const path = require('path'); // Node.js module for path operations
const os = require('os'); // Node.js module to get OS-specific info (e.g., home directory)


// ===========================
// UTILITY FUNCTION: Format Numbers as Currency
// ===========================
function formatCurrencyValue(value) {
  if (value == null || value === "") return "0.00";

  // Remove commas and non-numeric characters except dot
  value = value.toString().replace(/,/g, "").replace(/[^\d.]/g, "");

  let parts = value.split(".");
  let integerPart = parts[0];
  let decimalPart = parts[1] || "";

  // Format integer part with commas
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Ensure 2 decimal places
  decimalPart = decimalPart.substring(0, 2);
  if (decimalPart.length === 1) decimalPart += "0";
  if (decimalPart.length === 0) decimalPart = "00";

  return `${integerPart}.${decimalPart}`;
}


// ===========================
// PATH DEFINITIONS
// ===========================
const dataFolder = path.join(os.homedir(), 'MyAppDataTwo'); // Directory for data
const dataFile = path.join(dataFolder, 'GRATUITY.csv'); // CSV data file path


// ===========================
// DOM ELEMENT REFERENCES
// ===========================
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
const RetainedDetails = document.getElementById('retainedDetail').value;
const checkedBy = document.getElementById('checkedBy');

// Voucher display elements
const TpvNo = document.getElementById('TpvNo');
const TdisburseDate = document.getElementById('TdisburseDate');
const narration = document.getElementById('narration');
const PVamountAwarded = document.getElementById('PVamountAwarded');
const downAmount = document.getElementById('downAmount');
const downDate = document.getElementById('downDate');
const PvcheckedBy = document.getElementById('PvcheckedBy');
const PretainedDetails = document.getElementById('PretainedDetails');


// ===========================
// STATE VARIABLES
// ===========================
let Record = null; // Holds currently selected pensioner record
let isFirstDisbursement = false; // Track if this is first disbursement


// ===========================
// ERROR OVERLAY UTILITY FUNCTION
// ===========================
function showErrorOverlay() {
  const overlay = document.getElementById('overlayError');
  if (overlay) {
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 400); // Show briefly
  }
}


// ===========================
// DEBOUNCE FUNCTION TO LIMIT RAPID FIRING
// ===========================
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}


// ===========================
// SEARCH FUNCTION TO FIND PENSIONER
// ===========================
function searchPensioner() {
  const pensionID = searchIDInput.value.trim();

  if (!pensionID) {
    // Clear UI when empty input
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
      const totalDisbursed = parseFloat(row[209]) || 0;

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

      // Check if all 1st disbursement fields are empty
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
    adminFeeAmount.textContent = "0.00";
    pensioneerName.textContent = ` ${Record.name}`;
    amountAwarded.textContent = formatCurrencyValue(Record.originalAmount);
    totalDisbursedDisplay.textContent = formatCurrencyValue(Record.totalDisbursed);
    balanceDisplay.textContent = formatCurrencyValue(Record.balance);
    pensionerDetailsDiv.style.display = 'block';
    calculateAdminFee();
    updateLiveBalance();
  }
}


// ===========================
// ADMIN FEE CALCULATION
// ===========================
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
  fee = Math.round(fee * 100) / 100; // Round to 2 decimals

  adminFeeAmount.textContent = formatCurrencyValue(fee);
}


// ===========================
// CALCULATE LIVE BALANCE BASED ON FEES AND CHEQUES
// ===========================
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

  const label = document.getElementById('LiveBalancelable');
  if (Record.originalAmount === updatedBalance) {
    label.textContent = "Unclaimed:";
  } else {
    label.textContent = "Retain :";
  }
}


// ===========================// ===========================
// BATCH PROCESSING VARIABLES AND INITIALIZATION
// ===========================
let currentBatch = []; // List of pensioners in current batch
let batchLimit = 0; // Limit for current batch size
let batchCount = 0; // Count of pensioners added


// ===========================
// START NEW BATCH SESSION
// ===========================
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


// ===========================
// EVENT LISTENERS FOR INPUTS
// ===========================
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

// Attach update function to each cheque amount input
for (let i = 1; i <= 9; i++) {
  const amountInput = document.getElementById(`chequeAmount${i}`);
  if (amountInput) {
    amountInput.addEventListener('input', updateLiveBalance);
  }
}


// ===========================
// SUBMIT FORM: HANDLE DISBURSEMENT SUBMISSION
// ===========================
let pendingDisbursement = null;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!Record) {
    result.textContent = "Please search and select a pensioner first.";
    return;
  }

  const RetainedDetails = document.getElementById('retainedDetail').value;
  const disburseDate = document.getElementById('disburseDate').value;
  const pvNo = document.getElementById('pvNo').value.trim();
  const judicialFee = parseFloat(document.getElementById('judicialServiceFee').value.replace(/,/g, '')) || 0;
  const adminFee = parseFloat(adminFeeAmount.textContent.replace(/,/g, '')) || 0;

  if (!disburseDate || !pvNo) {
    result.textContent = "Please enter both the PV No and disbursement date.";
    return;
  }

  let chequeNameHTML = '';
  let chequeAmountHTML = '';
  const chequeData = [];
  let chequeTotal = 0;
  let chequeSummaryHTML = '';

  // Gather cheque names/amounts
  for (let i = 1; i <= 9; i++) {
    const nameInput = document.getElementById(`chequeName${i}`);
    const amountInput = document.getElementById(`chequeAmount${i}`);
    const name = nameInput?.value.trim() || "";
    const amount = parseFloat(amountInput?.value.replace(/,/g, '') || 0);

    chequeData.push(name);
    chequeData.push(amount > 0 ? amount.toFixed(2) : "");
    chequeTotal += amount;

    if (name || amount > 0) {
      chequeNameHTML += `<div> ${name} </div>`;
      chequeAmountHTML += `<div>GHS ${formatCurrencyValue(amount)}</div>`;
      chequeSummaryHTML += `<div>Cheque ${i}: ${name} - GHS ${formatCurrencyValue(amount)}</div>`;
    }
  }

  const totalDisbursedAmount = chequeTotal + judicialFee + adminFee;
  const newTotalDisbursed = Record.totalDisbursed + totalDisbursedAmount;
  const newBalance = (Record.originalAmount - newTotalDisbursed).toFixed(2);

  if (newTotalDisbursed > Record.originalAmount) {
    result.textContent = "Disbursement exceeds original amount.";
    showErrorOverlay();
    return;
  }

  // Store pending disbursement for confirmation
  pendingDisbursement = {
    pvNo, disburseDate, chequeData, chequeTotal, judicialFee, adminFee,
    newTotalDisbursed, newBalance
  };

  // Show confirmation modal
  document.getElementById('confirmationContent').innerHTML = `
    <strong>PV No:</strong> ${pvNo}<br/>
    <strong>Deceased Name:</strong> ${Record.name}<br/>
    <strong>Disbursement Date:</strong> ${disburseDate}<br/>
    <strong>Estate Type:</strong> ${EstateTypeInput.value}<br/>
    <strong>Admin Fee Rate:</strong> ${adminFeeRateInput.value}%<br/>
    <strong>Amount Awarded:</strong> GHS ${formatCurrencyValue(Record.balance)}<br/>
    <strong>Admin Fee:</strong> GHS ${formatCurrencyValue(adminFee)}<br/>
    <strong>Judicial Fee:</strong> GHS ${formatCurrencyValue(judicialFee)}<br/>
    <strong>Cheque Total:</strong> GHS ${formatCurrencyValue(chequeTotal)}<br/>
    <strong>Current Disbursement Total:</strong> GHS ${formatCurrencyValue(totalDisbursedAmount)}<br/>
    <strong>Retained Portion:</strong> GHS ${formatCurrencyValue(newBalance)}<br/>
    <hr/>
    ${chequeSummaryHTML}
  `;

  document.getElementById('confirmationModal').style.display = 'flex';

  // Set payment voucher preview details
  document.getElementById('paymentVoucher').style.display = 'none';
  TpvNo.textContent = pvNo;
  TdisburseDate.textContent = disburseDate;
  downDate.textContent = disburseDate;
  PvcheckedBy.textContent = checkedBy.value; 
  narration.textContent = 
    (`BEING ${EstateTypeInput.value} AWARDED THE LATE ${Record.name}`).toUpperCase();
 
  document.getElementById('adminFeeDetails').innerHTML =
    `LESS ADMINISTRATIVE FEE (${adminFeeRateInput.value}% OF ${formatCurrencyValue(Record.originalAmount)}) <br/>RGD NTR HOLDING ACCOUNT`;

  document.getElementById('PVadminFeeAmount').textContent = ` ${formatCurrencyValue(adminFee)}`;
  document.getElementById('judicialServFeeDetails').innerHTML = `JUDICIAL SERVICE FEE `;
  document.getElementById('judicialServFeeAmount').textContent = ` GHS ${formatCurrencyValue(judicialFee)} `;
  PVamountAwarded.textContent = ` ${formatCurrencyValue(Record.balance)}`;
  downAmount.textContent = ` GHS ${formatCurrencyValue(Record.balance)}`;
  document.getElementById('chequeNames').innerHTML = ` ${chequeNameHTML}`;
  document.getElementById('chequeAmounts').innerHTML = ` ${chequeAmountHTML}`;
  document.getElementById('retainedDetails').textContent = RetainedDetails;
  document.getElementById('retainedAmount').textContent = `GHS${formatCurrencyValue(newBalance)}`;
});


// ===========================
// CONFIRM AND SAVE DISBURSEMENT TO CSV
// ===========================
document.getElementById('confirmSaveBtn').addEventListener('click', () => {
  if (!pendingDisbursement) return;

  const content = fs.readFileSync(dataFile, 'utf-8');
  const lines = content.trim().split('\n');
  const recordLine = lines[Record.lineIndex].split(',');

  // Find next disbursement slot (each disbursement uses 20 columns)
  let disbursementCount = 0;
  for (let i = 6; i < 206; i += 20) {
    if (recordLine[i]?.trim()) disbursementCount++;
    else break;
  }

  const newStartIndex = 6 + disbursementCount * 20;
  if (newStartIndex + 20 > 205) {
    result.textContent = "Maximum number of disbursements reached.";
    document.getElementById('confirmationModal').style.display = 'none';
    return;
  }

  // Fill in new disbursement data
  const { pvNo, disburseDate, chequeData, chequeTotal, judicialFee, adminFee, newTotalDisbursed, newBalance } = pendingDisbursement;

  recordLine[newStartIndex] = pvNo;
  recordLine[newStartIndex + 1] = disburseDate;
  for (let i = 0; i < 18; i++) {
    recordLine[newStartIndex + 2 + i] = chequeData[i] || "";
  }

  // Update totals
  recordLine[206] = (parseFloat(recordLine[206] || 0) + chequeTotal).toFixed(2); // Cheques
  recordLine[207] = (parseFloat(recordLine[207] || 0) + judicialFee).toFixed(2); // Judicial Fee
  recordLine[208] = (parseFloat(recordLine[208] || 0) + adminFee).toFixed(2); // Admin Fee
  recordLine[209] = newTotalDisbursed.toFixed(2); // Total disbursed
  recordLine[210] = newBalance; // Balance

  lines[Record.lineIndex] = recordLine.join(',');
  fs.writeFileSync(dataFile, lines.join('\n'), 'utf-8');

  document.getElementById('confirmationModal').style.display = 'none';
  document.getElementById('paymentVoucher').style.display = 'none';
  document.getElementById('paymentVoucher').style.display = 'block';
  result.textContent = "Disbursement saved successfully.";
  pendingDisbursement = null;

  // Push to batch if admin fee charged
  if (adminFee > 0) {
    currentBatch.push({
      name: Record.name,
      awarded: Record.originalAmount,
      adminFee: adminFee
    });

    batchCount++;
    if (batchCount >= batchLimit) {
      showBatchSummary();
    }
  }
});


// ===========================
// DISPLAY BATCH SUMMARY TABLE
// ===========================
function showBatchSummary() {
  if (currentBatch.length === 0) {
    document.getElementById('batchSummaryContent').innerHTML = `<p>No pensioners in this batch had an admin fee.</p>`;
  } else {
    let totalAwarded = 0;
    let totalAdminFee = 0;

    const tableRows = currentBatch.map((entry, index) => {
      totalAwarded += entry.awarded;
      totalAdminFee += entry.adminFee;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${entry.name}</td>
          <td>GHS ${formatCurrencyValue(entry.awarded)}</td>
          <td>GHS ${formatCurrencyValue(entry.adminFee)}</td>
        </tr>
      `;
    }).join("");

    document.getElementById('batchSummaryContent').innerHTML = `
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Deceased Name</th>
            <th>Amount Awarded</th>
            <th>Admin Fee Charged</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"><strong>Totals</strong></td>
            <td><strong>GHS ${formatCurrencyValue(totalAwarded)}</strong></td>
            <td><strong>GHS ${formatCurrencyValue(totalAdminFee)}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;
  }

  document.getElementById('batchSummary').style.display = 'block';
  document.getElementById('batchStatus').textContent = "Batch completed.";

  // Reset batch
  batchLimit = 0;
  batchCount = 0;
  currentBatch = [];
}
