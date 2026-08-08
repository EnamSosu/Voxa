import { auth, onAuthStateChanged, signOut } from "./firebase.js";

const logoutBtn = document.getElementById("logoutBtn");
const downloadBtn = document.getElementById("downloadBtn");
const userNameEl = document.getElementById("userName");
const mobileUserNameEl = document.getElementById("mobileUserName");

// New profile elements
const profileNameEl = document.getElementById("profileName");
const profileEmailEl = document.getElementById("profileEmail");
const userAvatarEl = document.getElementById("userAvatar");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
// Apply saved theme
const saved = localStorage.getItem("voxa-theme");
if (saved === "dark") {
  document.documentElement.classList.add("dark");
}
/* ---------- Auth & show user name + profile ---------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth/login.html";
    return;
  }

  // Use displayName or the part before @ in email
  const displayName =
    user.displayName ||
    (user.email ? user.email.split("@")[0] : "User");

  const email = user.email || "";

  // Main welcome text
  if (userNameEl) {
    userNameEl.textContent = displayName;
  }

  // Mobile top bar
  if (mobileUserNameEl) {
    mobileUserNameEl.textContent = displayName;
  }

  // Sidebar profile
  if (profileNameEl) {
    profileNameEl.textContent = displayName;
  }
  if (profileEmailEl) {
    profileEmailEl.textContent = email;
  }

  // Avatar (photo or initials)
  if (userAvatarEl) {
    if (user.photoURL) {
      userAvatarEl.style.backgroundImage = `url(${user.photoURL})`;
      userAvatarEl.textContent = "";
      userAvatarEl.classList.add("has-photo");
    } else {
      const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      userAvatarEl.textContent = initials || "U";
      userAvatarEl.classList.remove("has-photo");
    }
  }
});

/* ---------- Logout ---------- */
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "../auth/login.html";
  } catch (error) {
    alert(error.message);
  }
});

/* ---------- Download button ---------- */
downloadBtn.addEventListener("click", () => {
  alert("Extension download will start here.");
});

/* ---------- Hamburger menu ---------- */
function openSidebar() {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
  document.body.style.overflow = "hidden"; // stop background scrolling
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

hamburgerBtn.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// Close menu when a nav link is clicked (good on mobile)
sidebar.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 800) {
      closeSidebar();
    }
  });
});

// Close with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});