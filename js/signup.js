import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "./firebase.js";

const signupForm = document.getElementById("signupForm");
const googleBtn = document.getElementById("googleSignup");


// EMAIL SIGNUP
signupForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    await createUserWithEmailAndPassword(auth, email, password);

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


// SUCCESS POPUP
function showSuccess(message){

  const popup = document.createElement("div");
  popup.className = "success-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    window.location.href = "../dashboard/dashboard.html";
  }, 2000);

}


// ERROR POPUP
function showError(message){

  const popup = document.createElement("div");
  popup.className = "error-popup";
  popup.innerText = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 3000);

}