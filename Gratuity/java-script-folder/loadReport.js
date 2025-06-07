(() => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const Papa = window.Papa;

  window.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('yearSelect');
    const startPeriod = document.getElementById('startPeriod');
    const endPeriod = document.getElementById('endPeriod');
    const filterPeriodInput = document.getElementById('filterPeriod');

    const filterByYearBtn = document.getElementById('filterByYearBtn');
    const filterByRangeBtn = document.getElementById('filterByRangeBtn');
    const filterByPeriodBtn = document.getElementById('filterByPeriodBtn');

    const resultsDiv = document.getElementById('results');

    const dataFolder = path.join(os.homedir(), 'MyAppDataTwo');
    const filePath = path.join(dataFolder, 'GRATUITY.csv');

    let allData = [];

    // Helper: Convert YYYY-MM to "Month Year", e.g. "2025-06" => "June 2025"
    function formatMonthYear(yyyymm) {
      if (!yyyymm) return "";
      const [year, month] = yyyymm.split('-');
      if (!year || !month) return yyyymm;
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    // Load CSV data and initialize dropdowns
    function loadDataAndSetup() {
      if (!fs.existsSync(filePath)) {
        resultsDiv.innerHTML = `<p style="color:red;">Data file not found at ${filePath}</p>`;
        return;
      }

      const fileData = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(fileData, { header: true, skipEmptyLines: true });
      allData = parsed.data;

      // Extract unique periods and years from data
      const periodsSet = new Set();
      const yearsSet = new Set();

      allData.forEach(row => {
        let period = row['Period'];
        if (period) {
          periodsSet.add(period);
          let year = period.split('-')[0];
          if (year) yearsSet.add(year);
        }
      });

      // Sort periods and years ascending
      const sortedPeriods = Array.from(periodsSet).sort();
      const sortedYears = Array.from(yearsSet).sort();

      // Populate yearSelect
      yearSelect.innerHTML = `<option value="">-- Select Year --</option>`;
      sortedYears.forEach(y => {
        yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
      });

      // Populate startPeriod and endPeriod selects with formatted month names
      startPeriod.innerHTML = `<option value="">-- Select Start Period --</option>`;
      endPeriod.innerHTML = `<option value="">-- Select End Period --</option>`;

      sortedPeriods.forEach(p => {
        const formatted = formatMonthYear(p);
        startPeriod.innerHTML += `<option value="${p}">${formatted}</option>`;
        endPeriod.innerHTML += `<option value="${p}">${formatted}</option>`;
      });
    }

    // Render table and total amount for filtered rows
    function renderResults(filteredRows, filterDescription) {
      if (!filteredRows || filteredRows.length === 0) {
        resultsDiv.innerHTML = `<p>No entries found for ${filterDescription}</p>`;
        return;
      }

      const totalAmount = filteredRows.reduce((sum, row) => {
        let amt = parseFloat(row['Amount Awarded'] || row['Amount Received'] || 0);
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);

      let tableHTML = `
        <h3>Results for: ${filterDescription}</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <thead>
            <tr>
              <th>Pension ID</th>
              <th>Deceased Name</th>
              <th>Amount Awarded</th>
              <th>Workplace</th>
              <th>Receipt Date</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
      `;

      filteredRows.forEach(row => {
        const formattedPeriod = formatMonthYear(row['Period']);
        tableHTML += `
          <tr>
            <td>${row['Pension ID'] || ''}</td>
            <td>${row['Deceased Name'] || ''}</td>
            <td>${parseFloat(row['Amount Awarded'] || row['Amount Received'] || 0).toFixed(2)}</td>
            <td>${row['Workplace'] || ''}</td>
            <td>${row['Receipt Date'] || ''}</td>
            <td>${formattedPeriod}</td>
          </tr>
        `;
      });

      tableHTML += `
          </tbody>
        </table>
        <p><strong>Total Amount Awarded: </strong> ${totalAmount.toFixed(2)}</p>
      `;

      resultsDiv.innerHTML = tableHTML;
    }

    // Filter functions
    function filterByPeriod(period) {
      const filtered = allData.filter(row => row['Period'] === period);
      renderResults(filtered, `Period ${formatMonthYear(period)}`);
    }

    function filterByYear(year) {
      const filtered = allData.filter(row => (row['Period'] || '').startsWith(year));
      renderResults(filtered, `Year ${year}`);
    }

    function filterByRange(start, end) {
      if (!start || !end) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select both start and end periods.</p>`;
        return;
      }
      if (start > end) {
        resultsDiv.innerHTML = `<p style="color:red;">Start period cannot be after end period.</p>`;
        return;
      }
      const filtered = allData.filter(row => {
        const p = row['Period'];
        return p >= start && p <= end;
      });
      renderResults(filtered, `Period Range ${formatMonthYear(start)} to ${formatMonthYear(end)}`);
    }

    // Event Listeners
    filterByPeriodBtn.addEventListener('click', () => {
      const period = filterPeriodInput.value;
      if (!period) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select a period to filter.</p>`;
        return;
      }
      filterByPeriod(period);
    });

    filterByYearBtn.addEventListener('click', () => {
      const year = yearSelect.value;
      if (!year) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select a year to filter.</p>`;
        return;
      }
      filterByYear(year);
    });

    filterByRangeBtn.addEventListener('click', () => {
      const start = startPeriod.value;
      const end = endPeriod.value;
      filterByRange(start, end);
    });

    // Initial load
    loadDataAndSetup();
  });
})();
