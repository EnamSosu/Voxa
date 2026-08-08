import { 
  db,
  collection,
  addDoc,
  serverTimestamp
} from "./firebase.js";
let rating = 0;
let hoverRating = 0;

const stars = document.querySelectorAll(".star");
const feedbackText = document.getElementById("feedbackText");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");
const saved = localStorage.getItem("voxa-theme");
if (saved === "dark") {
  document.documentElement.classList.add("dark");
}
// Stars hover & click
stars.forEach(star => {
  star.addEventListener("mouseenter", () => {
    hoverRating = parseInt(star.dataset.value);
    updateStars();
  });
  star.addEventListener("mouseleave", () => {
    hoverRating = 0;
    updateStars();
  });
  star.addEventListener("click", () => {
    rating = parseInt(star.dataset.value);
    updateStars();
  });
});

function updateStars() {
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    star.classList.toggle("hover", hoverRating > 0 && val <= hoverRating);
    star.classList.toggle("selected", val <= rating);
  });
}

// Handle submit
submitBtn.addEventListener("click", async () => {

  if(rating === 0 || feedbackText.value.trim() === ""){
    alert("Please select a star rating and enter your feedback.");
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

   await addDoc(collection(db, "feedback"), {
  rating: rating,
  text: feedbackText.value.trim(),
  source: "website", // VERY IMPORTANT
  createdAt: serverTimestamp()
});

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Feedback";
    rating = 0;
    feedbackText.value = "";
    updateStars();
    successMsg.style.display = "block";

    setTimeout(() => { successMsg.style.display = "none"; }, 2500);

  } catch(error){
    alert("Error submitting feedback");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Feedback";
  }

});