chrome.storage.local.get("colorFilter", (data) => {
  if (data.colorFilter) {
    document.body.style.filter = data.colorFilter;
  }
});

