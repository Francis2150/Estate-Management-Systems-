// Node.js core modules for file and system path operations 
const fs = require('fs');
const path = require('path');
const os = require('os');

// Wait for the HTML DOM to fully load before executing script
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('data-form');
  const status = document.getElementById('status');
  const periodInput = document.getElementById('period');
  const dateInput = document.getElementById('date');
  const updateBtn = document.getElementById('update-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const pensionIDInput = document.getElementById('pensionID');

  dateInput.value = new Date().toISOString().split('T')[0];

  const savedPeriod = localStorage.getItem('savedPeriod');
  if (savedPeriod) {
    periodInput.value = savedPeriod;
  }

  const dataFolder = path.join(os.homedir(), 'MyAppDataTwo');
  const filePath = path.join(dataFolder, 'GRATUITYTRIAL.csv');

  // Build header with fixed and dynamic columns
  const header = [
    'Pension ID', 'Deceased Name', 'Amount Awarded', 'Workplace', 'Receipt Date', 'Period'
  ];

  // Add disbursement blocks (PV No, Date, then 9 cheques per disbursement)
  for (let i = 1; i <= 10; i++) {
    header.push(`PV No ${i}`);
    header.push(`Disbursement Date ${i}`);
    for (let j = 1; j <= 9; j++) {
      header.push(`Cheque Name ${i}.${j}`);
      header.push(`Cheque Amount ${i}.${j}`);
    }
  }

  // Add summary columns at the end
  header.push(
    'Total Cheques',
    'Judicial Service Fee',
    'Administrative Charge',
    'Total Disbursed',
    'Balance'
  );

  // Utility: read CSV file into array of objects with dynamic keys
  function readCSV() {
    if (!fs.existsSync(filePath)) return [];
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  }

  // Utility: write full CSV file from array of objects with header keys order
  function writeCSV(data) {
    const rows = data.map(d => {
      return header.map(h => {
        // Escape commas and quotes if needed
        let val = d[h] !== undefined ? d[h] : '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });
    fs.writeFileSync(filePath, header.join(',') + '\n' + rows.join('\n'));
  }

  // Utility: get input values as object (basic fields only)
  function getFormData() {
    const id = pensionIDInput.value.trim();
    const name = document.getElementById('fullName').value.trim();
    const amountInput = document.getElementById('amountReceived').value.trim().replace(/,/g, '');
    const amount = parseFloat(amountInput);
    const workPlace = document.getElementById('placeOfWork').value.trim();
    const date = dateInput.value.trim();
    const period = periodInput.value.trim();

    // For demo: initialize disbursement and summary fields empty
    // You can expand this part to read these fields from your form if you have inputs for them

    return { id, name, amount, workPlace, date, period };
  }

  // Validation for required fields
  function validate(data) {
    if (!data.id || !data.name || isNaN(data.amount) || !data.workPlace || !data.date || !data.period) {
      status.textContent = '❗ Please fill all fields with valid data.';
      return false;
    }
    return true;
  }

  // 🔘 CREATE/ADD functionality
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();

    if (!validate(data)) return;

    const records = readCSV();

    if (records.find(r => r['Pension ID'] === data.id)) {
      status.textContent = `❌ Pension ID "${data.id}" already exists. Use update instead.`;
      return;
    }

    // Build new record with all headers
    const newRecord = {};
    header.forEach(h => {
      newRecord[h] = '';  // initialize empty
    });

    // Fill basic fields
    newRecord['Pension ID'] = data.id;
    newRecord['Deceased Name'] = data.name;
    newRecord['Amount Awarded'] = data.amount.toFixed(2);
    newRecord['Workplace'] = data.workPlace;
    newRecord['Receipt Date'] = data.date;
    newRecord['Period'] = data.period;

    // Disbursements and cheques stay empty by default

    // Summary columns empty by default

    // Save record
    records.push(newRecord);

    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder, { recursive: true });
    }

    writeCSV(records);

    status.textContent = `✅ Added: ${data.name}, ${data.amount.toFixed(2)}, ${data.workPlace}, (ID: ${data.id})`;
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    periodInput.value = data.period;
    localStorage.setItem('savedPeriod', data.period);
  });

  // 🔁 UPDATE functionality
  updateBtn.addEventListener('click', () => {
    const data = getFormData();
    if (!validate(data)) return;

    const records = readCSV();
    const index = records.findIndex(r => r['Pension ID'] === data.id);

    if (index === -1) {
      status.textContent = `❌ Pension ID "${data.id}" not found for update.`;
      return;
    }

    // Update only basic fields here; disbursements and summary fields can be updated similarly if you add inputs
    records[index]['Deceased Name'] = data.name;
    records[index]['Amount Awarded'] = data.amount.toFixed(2);
    records[index]['Workplace'] = data.workPlace;
    records[index]['Receipt Date'] = data.date;
    records[index]['Period'] = data.period;

    writeCSV(records);
    status.textContent = `🔄 Updated record for ID: ${data.id}`;
  });

  // ❌ DELETE functionality
  deleteBtn.addEventListener('click', () => {
    const id = pensionIDInput.value.trim();
    if (!id) {
      status.textContent = '❗ Enter Pension ID to delete.';
      return;
    }

    const records = readCSV();
    const index = records.findIndex(r => r['Pension ID'] === id);

    if (index === -1) {
      status.textContent = `❌ Pension ID "${id}" not found.`;
      return;
    }

    records.splice(index, 1);
    writeCSV(records);
    status.textContent = `🗑️ Deleted record for ID: ${id}`;
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    periodInput.value = savedPeriod || '';
  });

  // 🔎 Auto-fill form when Pension ID exists
  pensionIDInput.addEventListener('blur', () => {
    const id = pensionIDInput.value.trim();
    if (!id) return;

    const records = readCSV();
    const record = records.find(r => r['Pension ID'] === id);

    if (record) {
      document.getElementById('fullName').value = record['Deceased Name'];
      document.getElementById('amountReceived').value = parseFloat(record['Amount Awarded']).toLocaleString();
      document.getElementById('placeOfWork').value = record['Workplace'];
      dateInput.value = record['Receipt Date'];
      periodInput.value = record['Period'];
      status.textContent = `ℹ️ Record found for ID: ${id}. Fields populated.`;
    } else {
      status.textContent = `❌ No record found for ID: ${id}`;
    }
  });
});
