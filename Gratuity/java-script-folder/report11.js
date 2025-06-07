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

  dateInput.value = new Date().toISOString().split('T')[0];

  const savedPeriod = localStorage.getItem('savedPeriod');
  if (savedPeriod) {
    periodInput.value = savedPeriod;
  }

  const dataFolder = path.join(os.homedir(), 'MyAppDataTwo');
  const filePath = path.join(dataFolder, 'GRATUITY.csv');

  const header = ['Pension ID', 'Deceased Name', 'Amount Awarded', 'Workplace', 'Receipt Date', 'Period'];

  // Utility: read CSV file into array of objects
  function readCSV() {
    if (!fs.existsSync(filePath)) return [];
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    const rows = lines.slice(1).map(line => {
      const [id, name, amount, workPlace, date, period] = line.split(',');
      return { id, name, amount, workPlace, date, period };
    });
    return rows;
  }

  // Utility: write full CSV file
  function writeCSV(data) {
    const rows = data.map(d => [d.id, d.name, d.amount, d.workPlace, d.date, d.period].join(','));
    fs.writeFileSync(filePath, header.join(',') + '\n' + rows.join('\n'));
  }

  // Utility: get input values as object
  function getFormData() {
    const id = document.getElementById('pensionID').value.trim();
    const name = document.getElementById('fullName').value.trim();
    const amountInput = document.getElementById('amountReceived').value.trim().replace(/,/g, '');
    const amount = parseFloat(amountInput);
    const workPlace = document.getElementById('placeOfWork').value.trim();
    const date = dateInput.value.trim();
    const period = periodInput.value.trim();

    return { id, name, amount, workPlace, date, period };
  }

  // Common validation
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

    // Check for existing Pension ID
    if (records.find(r => r.id === data.id)) {
      status.textContent = `❌ Pension ID "${data.id}" already exists. Use update instead.`;
      return;
    }

    records.push({
      id: data.id,
      name: data.name,
      amount: data.amount.toFixed(2),
      workPlace: data.workPlace,
      date: data.date,
      period: data.period
    });

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
    const index = records.findIndex(r => r.id === data.id);

    if (index === -1) {
      status.textContent = `❌ Pension ID "${data.id}" not found for update.`;
      return;
    }

    records[index] = {
      id: data.id,
      name: data.name,
      amount: data.amount.toFixed(2),
      workPlace: data.workPlace,
      date: data.date,
      period: data.period
    };

    writeCSV(records);
    status.textContent = `🔄 Updated record for ID: ${data.id}`;
  });

  // ❌ DELETE functionality
  deleteBtn.addEventListener('click', () => {
    const id = document.getElementById('pensionID').value.trim();
    if (!id) {
      status.textContent = '❗ Enter Pension ID to delete.';
      return;
    }

    const records = readCSV();
    const index = records.findIndex(r => r.id === id);

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
});

