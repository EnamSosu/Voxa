import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "./firebase.js";

const signupForm = document.getElementById("signupForm");
const googleBtn = document.getElementById("googleSignup");

// EMAIL SIGNUP
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Save the user's name
    if (name) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
    }

    showSuccess("Account created successfully 🎉");
  } catch (error) {
    showError(error.message);
  }
});

// GOOGLE SIGNUP
googleBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
    showSuccess("Welcome to Spectra 🎉");
  } catch (error) {
    showError(error.message);
  }
});

// SUCCESS + REDIRECT
function showSuccess(message) {
  const popup = document.createElement("div");
  popup.className = "success-popup";
  popup.innerText = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    window.location.replace("../dashboard/dashboard.html");
  }, 1500);
}

// ERROR
function showError(message) {
  const popup = document.createElement("div");
  popup.className = "error-popup";
  popup.innerText = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);
}