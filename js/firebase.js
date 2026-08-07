import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail
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

const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  collection,
  addDoc,
  serverTimestamp
};