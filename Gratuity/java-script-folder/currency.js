 // Main conversion function
    function convertNumberToWords(amount) {
      // Arrays holding words for numbers
      const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"];

      const tensWords = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

      // Recursive helper function to convert number to words
      function convertToWords(n) {
        if (n < 20) return words[n];
        else if (n < 100)
          return tensWords[Math.floor(n / 10)] + (n % 10 ? " " + words[n % 10] : "");
        else if (n < 1000)
          return words[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertToWords(n % 100) : "");
        else if (n < 1_000_000)
          return combineWithFormat(Math.floor(n / 1000), "Thousand", n % 1000);
        else if (n < 1_000_000_000)
          return combineWithFormat(Math.floor(n / 1_000_000), "Million", n % 1_000_000);
        else if (n < 1_000_000_000_000)
          return combineWithFormat(Math.floor(n / 1_000_000_000), "Billion", n % 1_000_000_000);
        else if (n < 1_000_000_000_000_000)
          return combineWithFormat(Math.floor(n / 1_000_000_000_000), "Trillion", n % 1_000_000_000_000);
        else return "Number too large"; // Avoids excessive computation
      }

      // Helper function to combine the main number and remainder
      function combineWithFormat(mainPart, label, remainder) {
        let result = convertToWords(mainPart) + " " + label;
        if (remainder) {
          result += remainder < 100 ? " and " : ", ";
          result += convertToWords(remainder);
        }
        return result;
      }

      // Validate input: if not a number, return an error message
      if (!amount || isNaN(amount)) return "INVALID INPUT";

      // Clean the input by removing currency symbols and commas
      const cleanedAmount = amount.toString().replace(/[^0-9.]/g, "");

      // Split into Cedis and Pesewas parts
      const [cedisStr, pesewasStr] = cleanedAmount.split(".");
      const cedis = parseInt(cedisStr || "0"); // Defaults to 0 if missing
      const pesewas = parseInt((pesewasStr || "0").substring(0, 2).padEnd(2, "0")); // Always 2 digits

      let result = "";

      // Handle case when both parts are zero
      if (cedis === 0 && pesewas === 0) {
        return "ZERO GHANA CEDIS";
      }

      // Convert Cedis part to words
      if (cedis > 0) {
        result += convertToWords(cedis) + " Ghana Cedis";
      }

      // Convert Pesewas part to words (if any)
      if (pesewas > 0) {
        if (cedis > 0) result += " "; // Add space if Cedis is present
        result += convertToWords(pesewas) + " Pesewas";
      }

      return result.toUpperCase(); // Output in UPPERCASE as required
    }

    // Event listener for real-time conversion when user types in input
    document.getElementById("amountAwarded").addEventListener("input", function () {
      const rawInput = this.value; // Get input value
      const output = convertNumberToWords(rawInput); // Convert to words
      document.getElementById("amountInWords").innerText = output; // Display in output <p>
    });