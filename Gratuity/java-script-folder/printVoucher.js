function printVoucherSection() {
  const voucher = document.querySelector('.a4Sheet');
  if (!voucher) {
    alert("Voucher section not found.");
    return;
  }

  // Clone the content
  document.getElementById('paymentVoucher').style.display = 'block';
  const printContent = voucher.cloneNode(true);

  // Create a new print window
  const printWindow = window.open('', '_blank');

  // Define the CSS you want to apply (copy from your original <style>)
  const style = `
   <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Calibri;
    }

  

    .a4Sheet {
  width: 210mm;
  height: 277mm; /* Safer, gives room for browser print margins */
  padding: 10mm 15mm; /* Slightly reduced */
  box-shadow: none; /* Remove shadows for print */
  page-break-inside: avoid;
}


    .pvContainer {
      width: 105%;
      height: 98%;
      display: grid;
      grid-template-rows: 1fr 6fr;
    }

    .header {
      display: grid;
      grid-template-rows: 2fr 1fr;
    }

    .topHeader {
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      row-gap: 0;
      text-align: center;
      font-weight: bolder;
      font-size: 22px;
      padding-bottom: 0;
    }

    .thirdP {
      margin-bottom: 0;
    }

    .subHeader {
      display: grid;
      grid-template-columns: 3fr 1fr;
    }

    .body {
      display: grid;
      grid-template-rows: 1fr 3.5fr 3fr;
      border: 2px solid #000;
    }

    .bodyHeader {
      border-bottom: 2px solid #000;
      display: grid;
      grid-template-columns: 3fr 1fr;
    }

    .bodyHeaderLeft {
      display: grid;
      grid-template-rows: 1fr 1.5fr;
      border-right: 2px solid #000;
    }

    .particularsHeader {
      display: flex;
      border-bottom: 2px solid #000;
      justify-content: center;
      align-items: flex-end;
      font-weight: bolder;
    }

    .bodyHeaderRight {
      display: grid;
      grid-template-rows: 1fr 1.5fr;
    }

    .amountHeader {
      display: flex;
      border-bottom: 2px solid #000;
      justify-content: center;
      align-items: flex-end;
      font-weight: bolder;
    }

    .bodyMiddle {
      display: grid;
      grid-template-columns: 3fr 1fr;
      border-bottom: 2px solid #000;
    }

    .bodyMiddleLeft {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      border-right: 2px solid #000;
    }

    .nameSide {
      display: grid;
      grid-template-rows: 1fr 7fr;
      border-right: 2px solid #000;
    }

    .nameHeader {
      display: flex;
      border-bottom: 2px solid #000;
      justify-content: center;
      align-items: flex-end;
      font-weight: bolder;
    }
    .amountDetail {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      
      font-weight: bolder;
      padding: 2mm;
      text-align: right;
    }

     .namedetail {
      text-align: center;
      display: grid;
      grid-template-rows: 6fr 1fr;
    }
    
    .retainDetailtittle{
      text-align: center;
      text-decoration: underline;
    }
    .retainDetailtittle,.retainDetails{
      text-align: center;
      
    }

    .nameTop {
      display: grid;
      padding: 2mm;
      grid-template-rows: 1.5fr 1fr 6fr 1.5fr;
    }

    .signatureSide {
      display: grid;
      grid-template-rows: 1fr 7fr;
    }

    .signatureHeader {
      display: flex;
      border-bottom: 2px solid #000;
      justify-content: center;
      align-items: flex-end;
      font-weight: bolder;
    }

    .signatureDetail {
      display: grid;
      grid-template-rows: 6fr 1fr;
    }

    .bodyMiddleRight {
      display: grid;
      grid-template-rows: 1fr 7fr;
    }

    .MTspace {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      font-weight: bolder;
    }

    .chequeAmounts {
      display: grid;
      grid-template-rows: 7fr 1fr;
    }

     .amountTop {
      padding: 2mm;
      text-align: right;
      display: grid;
      grid-template-rows: 1.5fr 1fr 6fr 1fr;
    }

    .amountDown {
    
      font-weight: bolder;
      padding: 2mm;
      text-align: right;
      border-top: 2px solid #000;
    }

    .bodyDown {
      
      display: grid;
      grid-template-rows: 1fr 1.5fr 1fr 1fr;
    }

    .amountInWordsBox {
      padding-left: 4px;
      padding-top:12px ;
      display: flex;
      grid-template-columns: 1fr 7.6fr;
      culumn-gap: 2mm;
    }

    .amountInWordsLabel {
      margin-right:1mm;
   
     
    }
    .amountInWordsDetail {
      
    
    }

    .checkedByBox {
      display: grid;
      grid-template-columns: 0.8fr 1fr 0.8fr;
      border-bottom: 2px solid #000;
    }

    .checkedByLeft,
    .checkedByMid {
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      padding-left: 2px;
      align-items: center;
    }

    .checkedByRight {
      padding-top: 2mm;
      padding-right: 2mm;
    }

    .approved {
      font-weight: bolder;
      height: 90%;
      padding-top: 4px;
      padding-left: 4px;
      padding-right: 2px;
      border: 2px solid #000;
    }

    .certifiedBox {
      display: grid;
      grid-template-columns: 2.5fr 1fr;
      padding: 2px;
      column-gap: 2mm;
      border-bottom: 2px solid #000;
    }

    .witnessedByBox {
      display: grid;
      grid-template-rows: 1fr 1fr;
    }

    .witnessTOP {
      text-align: center;
    }

    .witnessDown {
      display: grid;
      grid-template-columns: 1.5fr 1.2fr 1fr;
      padding-left: 2px;
      padding-right: 2px;
      align-items: flex-end;
    }
  </style>
  `;

  // Write to the new window
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Payment Voucher</title>
      ${style}
    </head>
    <body>
      ${printContent.outerHTML}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

