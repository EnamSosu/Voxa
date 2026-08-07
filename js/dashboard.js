import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const logoutBtn = document.getElementById("logoutBtn");
const downloadBtn = document.getElementById("downloadBtn");


onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "../auth/login.html";

  }

});


logoutBtn.addEventListener("click", async () => {

  try {

    await signOut(auth);

    window.location.href = "../auth/login.html";

  } catch (error) {

    alert(error.message);

  }

});


downloadBtn.addEventListener("click", () => {

  alert("Extension download will start here.");

});