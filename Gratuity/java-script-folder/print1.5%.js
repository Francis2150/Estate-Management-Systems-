function startProcess() {
  // Step 1: Show the summary
  showBatchSummary();

  // Step 2: Show the print/cancel buttons
  const controls = document.getElementById('controls');
  if (controls) controls.style.display = 'block';

  // Optionally hide the start button
  const startButton = document.getElementById('startButton');
  if (startButton) startButton.style.display = 'none';
}


function showBatchSummary() {
  document.getElementById('batchSummary').style.display = 'block';
}

function cancelProcess() {
  const batchSummary = document.getElementById('batchSummary');
  if (batchSummary) batchSummary.style.display = 'none';

  const controls = document.getElementById('controls');
  if (controls) controls.style.display = 'none';

  const startButton = document.getElementById('startButton');
  if (startButton) startButton.style.display = 'inline-block';
}

function printAdminFee() {
  const voucher = document.querySelector('.table-container');
  if (!voucher) {
    alert("Voucher section not found.");
    return;
  }

  const printContent = voucher.cloneNode(true);
  const batchSummary = printContent.querySelector('#batchSummary');
  if (batchSummary) batchSummary.style.display = 'block';

  const style = `
    <style>
      body {
        font-family: Calibri;
        margin: 0;
        padding: 0;
      }

      .table-container {
        background-color: white;
        width: 260mm;
        margin: 0 auto;
      }

      .batch-header {
        font-size: 20px;
        text-align: center;
        margin: 20px 0;
      }

      .styled-table {
        border-collapse: collapse;
        width: 100%;
        font-size: 15px;
        border: 1px solid black;
        margin-top: 10px;
      }

      .styled-table th,
      .styled-table td {
        padding: 8px 12px;
        border: 1px solid black;
        text-align: left;
      }

      .styled-table th {
        text-align: center;
      }

      .styled-table tfoot {
        font-weight: bold;
      }

      #controls {
        display: none !important;
      }
    </style>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Admin Fee Summary</title>
        ${style}
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          window.onload = function() {
            window.print();

            window.onafterprint = function() {
              window.close();

              // Cleanup on original page
              const original = window.opener.document;
              original.getElementById('batchSummary').style.display = 'none';
              original.getElementById('controls').style.display = 'none';
              original.getElementById('startButton').style.display = 'inline-block';
            };
          };
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
