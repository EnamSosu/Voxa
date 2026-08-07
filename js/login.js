// login.js
// This handles login form submission and redirects to the dashboard

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent actual form submission

        // TODO: Here you can add real authentication later
        // For now, just redirect to the dashboard
        window.location.href = "../dashboard/dashboard.html";
    });

});import { 
  auth,
  signInWithEmailAndPassword
} from "./firebase.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "../dashboard/dashboard.html";

  } catch (error) {

    alert(error.message);

  }

});