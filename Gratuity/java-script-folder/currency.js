function convertNumberToWords(amount) {
  const words = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tensWords = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertToWords(n) {
    if (n < 20) {
      return words[n];
    } else if (n < 100) {
      return tensWords[Math.floor(n / 10)] + (n % 10 ? " " + words[n % 10] : "");
    } else if (n < 1000) {
      return words[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertToWords(n % 100) : "");
    } else if (n < 1_000_000) {
      return combineWithFormat(Math.floor(n / 1000), "Thousand", n % 1000, 3);
    } else if (n < 1_000_000_000) {
      return combineWithFormat(Math.floor(n / 1_000_000), "Million", n % 1_000_000, 6);
    } else if (n < 1_000_000_000_000) {
      return combineWithFormat(Math.floor(n / 1_000_000_000), "Billion", n % 1_000_000_000, 9);
    } else if (n < 1_000_000_000_000_000) {
      return combineWithFormat(Math.floor(n / 1_000_000_000_000), "Trillion", n % 1_000_000_000_000, 12);
    } else {
      return "Number too large";
    }
  }

  function combineWithFormat(mainNumberPart, numberLabel, remainder, segmentLength) {
    let result = convertToWords(mainNumberPart) + " " + numberLabel;

    if (remainder) {
      const remainderStr = remainder.toString().padStart(segmentLength, "0");
      const connector = remainderStr.startsWith("0") ? " and " : ", ";
      result += connector + convertToWords(remainder);
    }

    return result;
  }

  if (!amount || isNaN(amount)) return "INVALID INPUT";

  const cleanedAmount = amount.toString().replace(/[^0-9.]/g, "");
  const [cedisStr, pesewasStr] = cleanedAmount.split(".");
  const cedis = parseInt(cedisStr || "0", 10);
  const pesewas = parseInt((pesewasStr || "0").substring(0, 2).padEnd(2, "0"), 10);

  if (cedis === 0 && pesewas === 0) return "ZERO GHANA CEDIS";

  let result = "";
  if (cedis > 0) result += convertToWords(cedis) + " Ghana Cedis";
  if (pesewas > 0) result += (cedis > 0 ? " " : "") + convertToWords(pesewas) + " Pesewas";

  return result.toUpperCase();
}

// === MONITOR PVamountAwarded TEXT FOR CHANGES ===
const pvAmountElem = document.getElementById("PVamountAwarded");
const outputElem = document.getElementById("amountInWords");

function updateWordsFromElementText() {
  if (!pvAmountElem || !outputElem) return;

  // Sanitize: remove GHS, commas, extra spaces
  const rawText = pvAmountElem.textContent || "";
  const cleaned = rawText.replace(/GHS/i, "").replace(/,/g, "").trim();

  // Only process if it’s a valid number after cleanup
  const numericValue = parseFloat(cleaned);
  if (!isNaN(numericValue)) {
    const output = convertNumberToWords(numericValue);
    outputElem.innerText = output;
  } else {
    outputElem.innerText = "INVALID INPUT";
  }
}

// Setup MutationObserver
if (pvAmountElem) {
  const observer = new MutationObserver(updateWordsFromElementText);

  observer.observe(pvAmountElem, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // Call initially in case value already present
  updateWordsFromElementText();
}  

console.log(convertNumberToWords("200031823098.55"));
