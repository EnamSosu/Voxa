document.getElementById("getStartedBtn").addEventListener("click", () => {

window.location.href = "auth/login.html"

})


// Feedback Button
const feedbackBtn = document.getElementById("feedbackBtn");

feedbackBtn.addEventListener("click", function () {

    window.location.href = "feedback.html";

});


// ===== Dark / Light Mode =====
const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;

// Apply saved theme on load (so other pages can also use the same key)
function applyTheme(theme) {
  if (theme === "dark") {
    html.classList.add("dark");
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    html.classList.remove("dark");
    themeToggle.textContent = "🌙";
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

// Load preference (or system preference as fallback)
const savedTheme = localStorage.getItem("voxa-theme");
if (savedTheme) {
  applyTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  applyTheme("dark");
} else {
  applyTheme("light");
}

// Toggle + save
themeToggle.addEventListener("click", () => {
  const isDark = html.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  localStorage.setItem("voxa-theme", newTheme);
  applyTheme(newTheme);
});