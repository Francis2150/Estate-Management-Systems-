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

    // Helper: Convert YYYY-MM to "Month Year"
    function formatMonthYear(yyyymm) {
      if (!yyyymm) return "";
      const [year, month] = yyyymm.split('-');
      if (!year || !month) return yyyymm;
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    // Load CSV data
    function loadData() {
      if (!fs.existsSync(filePath)) {
        resultsDiv.innerHTML = `<p style="color:red;">Data file not found at ${filePath}</p>`;
        return [];
      }

      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const parsed = Papa.parse(fileData, { header: true, skipEmptyLines: true });
        return parsed.data;
      } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error reading data file: ${err.message}</p>`;
        return [];
      }
    }

    // Setup dropdowns
    function setupDropdowns(data) {
      const periodsSet = new Set();
      const yearsSet = new Set();

      data.forEach(row => {
        let period = row['Period'];
        if (period) {
          periodsSet.add(period);
          let year = period.split('-')[0];
          if (year) yearsSet.add(year);
        }
      });

      const sortedPeriods = Array.from(periodsSet).sort();
      const sortedYears = Array.from(yearsSet).sort();

      yearSelect.innerHTML = `<option value="">-- Select Year --</option>`;
      sortedYears.forEach(y => {
        yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
      });

      startPeriod.innerHTML = `<option value="">-- Select Start Period --</option>`;
      endPeriod.innerHTML = `<option value="">-- Select End Period --</option>`;

      sortedPeriods.forEach(p => {
        const formatted = formatMonthYear(p);
        startPeriod.innerHTML += `<option value="${p}">${formatted}</option>`;
        endPeriod.innerHTML += `<option value="${p}">${formatted}</option>`;
      });

      if (filterPeriodInput.tagName.toLowerCase() === 'select') {
        filterPeriodInput.innerHTML = `<option value="">-- Select Period --</option>`;
        sortedPeriods.forEach(p => {
          const formatted = formatMonthYear(p);
          filterPeriodInput.innerHTML += `<option value="${p}">${formatted}</option>`;
        });
      }
    }

    // Render filtered results
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
        <table>
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

    // Filter logic
    function filterByPeriod(period) {
      const filtered = allData.filter(row => row['Period'] === period);
      renderResults(filtered, `Period ${formatMonthYear(period)}`);
      if (filterPeriodInput) filterPeriodInput.value = period;
    }

    function filterByYear(year) {
      const filtered = allData.filter(row => (row['Period'] || '').startsWith(year));
      renderResults(filtered, `Year ${year}`);
      if (yearSelect) yearSelect.value = year;
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
      if (startPeriod) startPeriod.value = start;
      if (endPeriod) endPeriod.value = end;
    }

    // Auto-apply filter after reload
    let pendingFilter = localStorage.getItem('pendingFilter');
    allData = loadData();
    if (allData.length > 0) {
      setupDropdowns(allData);

      if (pendingFilter) {
        const { type, value } = JSON.parse(pendingFilter);
        localStorage.removeItem('pendingFilter');

        switch (type) {
          case 'period':
            filterByPeriod(value);
            break;
          case 'year':
            filterByYear(value);
            break;
          case 'range':
            filterByRange(value.start, value.end);
            break;
        }
        return;
      }
    }

    // Event Listeners (set filter then reload)
    filterByPeriodBtn.addEventListener('click', () => {
      const period = filterPeriodInput.value;
      if (!period) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select a period to filter.</p>`;
        return;
      }
      localStorage.setItem('pendingFilter', JSON.stringify({ type: 'period', value: period }));
      location.reload();
    });

    filterByYearBtn.addEventListener('click', () => {
      const year = yearSelect.value;
      if (!year) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select a year to filter.</p>`;
        return;
      }
      localStorage.setItem('pendingFilter', JSON.stringify({ type: 'year', value: year }));
      location.reload();
    });

    filterByRangeBtn.addEventListener('click', () => {
      const start = startPeriod.value;
      const end = endPeriod.value;
      if (!start || !end) {
        resultsDiv.innerHTML = `<p style="color:red;">Please select both start and end periods.</p>`;
        return;
      }
      if (start > end) {
        resultsDiv.innerHTML = `<p style="color:red;">Start period cannot be after end period.</p>`;
        return;
      }
      localStorage.setItem('pendingFilter', JSON.stringify({ type: 'range', value: { start, end } }));
      location.reload();
    });
  });
})();
