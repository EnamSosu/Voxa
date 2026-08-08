// -----------------------------------------------------
// history.js – Modern, link-only spoken history
// -----------------------------------------------------

const historyList = document.getElementById("historyList");
const refreshBtn = document.getElementById("refreshBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const closeBtn = document.getElementById("closeBtn");
const emptyMsg = document.getElementById("emptyMsg");

// -----------------------------------------------------
// RENDER HISTORY
// -----------------------------------------------------
function renderHistory() {
  chrome.storage.local.get("spokenHistory", (res) => {
    const history = res.spokenHistory || [];
    historyList.innerHTML = "";

    if (!history.length) {
      emptyMsg.style.display = "block";
      return;
    }

    emptyMsg.style.display = "none";

    history.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "history-item";

      // ------ TITLE ------
      const titleDiv = document.createElement("div");
      titleDiv.className = "history-title";
      titleDiv.textContent = item.pageTitle || "Untitled Page";
      li.appendChild(titleDiv);

      // ------ CLICKABLE URL ------
      const urlLink = document.createElement("a");
      urlLink.className = "history-url";
      urlLink.href = item.url || "#";
      urlLink.target = "_blank";
      urlLink.textContent = item.url || "No URL available";
      li.appendChild(urlLink);

      // ------ TIMESTAMP ------
      const dateDiv = document.createElement("div");
      dateDiv.className = "history-date";
      const date = item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : "Unknown date";
      dateDiv.textContent = date;
      li.appendChild(dateDiv);

      // ------ ACTION BUTTONS ------
      const actions = document.createElement("div");
      actions.className = "item-actions";

      // Play Button
      const playBtn = document.createElement("button");
      playBtn.className = "btn btn-play";
      playBtn.textContent = "Play";
      playBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          action: "playHistoryItem",
          text: item.text,
          voiceName: item.voiceName,
          rate: item.rate,
          pitch: item.pitch
        });
      });

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        chrome.storage.local.get("spokenHistory", (r) => {
          const updated = [...(r.spokenHistory || [])];
          updated.splice(index, 1);
          chrome.storage.local.set({ spokenHistory: updated }, renderHistory);
        });
      });

      actions.appendChild(playBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);

      historyList.appendChild(li);
    });
  });
}

// -----------------------------------------------------
// BUTTON EVENTS
// -----------------------------------------------------
refreshBtn.addEventListener("click", renderHistory);

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear ALL spoken history?")) return;
  chrome.storage.local.set({ spokenHistory: [] }, renderHistory);
});

closeBtn.addEventListener("click", () => window.close());

// -----------------------------------------------------
// INITIAL LOAD
// -----------------------------------------------------
renderHistory();