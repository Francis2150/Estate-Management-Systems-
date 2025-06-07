
  document.addEventListener("DOMContentLoaded", () => {
    const summary = document.getElementById("summary");
    const report = document.getElementById("report");
    const toggleBtn = document.getElementById("toggleBtn");
    const toggleBtnBack = document.getElementById("toggleBtnBack");

    // Restore toggle state after reload
    const view = localStorage.getItem("view");
    if (view === "report") {
      summary.classList.remove("active");
      report.classList.add("active");
      localStorage.removeItem("view"); // Optional: clear after using
    } else if (view === "summary") {
      report.classList.remove("active");
      summary.classList.add("active");
      localStorage.removeItem("view");
    }

    toggleBtn.addEventListener("click", () => {
      localStorage.setItem("view", "report");
      location.reload(); // force reload
    });

    toggleBtnBack.addEventListener("click", () => {
      localStorage.setItem("view", "summary");
      location.reload(); // force reload
    });
  });

