import {
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "./firebase.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");
const forgotPassword = document.getElementById("forgotPassword");
const saved = localStorage.getItem("voxa-theme");
if (saved === "dark") {
  document.documentElement.classList.add("dark");
}
// Load remembered email
window.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    console.log("Attempting login...");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user.email);

    // Remember Me
    if (rememberMe.checked) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // Redirect
    window.location.replace("../dashboard/dashboard.html");

  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
});

// FORGOT PASSWORD
forgotPassword.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    alert("Please enter your email address first.");
    emailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! Check your inbox and spam folder.");
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});