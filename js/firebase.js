import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWIjBx7o4YSJZw7gvkxhFKu5eGOPKLa5M",
  authDomain: "spectra-f0c6b.firebaseapp.com",
  projectId: "spectra-f0c6b",
  storageBucket: "spectra-f0c6b.firebasestorage.app",
  messagingSenderId: "434181860895",
  appId: "1:434181860895:web:758bda6eb55be916842f2a"
};

const app = initializeApp(firebaseConfig);

// ✅ ADD THIS (you were missing it)
const db = getFirestore(app);

const auth = getAuth(app);

// ✅ EXPORT EVERYTHING YOU NEED
export {
  db,
  auth,
  collection,
  addDoc,
  serverTimestamp
};