// =======================
// INSTALL
// =======================
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readSelection",
    title: "Read Selection",
    contexts: ["selection"]
  });
});

// =======================
// STATE
// =======================
let currentUtterance = null;
let isPaused = false;

// =======================
// SAVE HISTORY
// =======================
function saveToHistory(text, rate, pitch, voiceName, url = null, pageTitle = null) {
  chrome.storage.local.get(["spokenHistory"], (res) => {
    const history = res.spokenHistory || [];

    history.unshift({
      text,
      rate,
      pitch,
      voiceName,
      timestamp: Date.now(),
      url,
      pageTitle
    });

    if (history.length > 100) history.pop();
    chrome.storage.local.set({ spokenHistory: history });
  });
}

// =======================
// TEXT CHUNKING
// =======================
function chunkText(text, chunkSize = 300) {
  const chunks = [];

  while (text.length > 0) {
    let chunk = text.slice(0, chunkSize);
    const lastPeriod = chunk.lastIndexOf(". ");

    if (lastPeriod !== -1 && lastPeriod > 100) {
      chunk = text.slice(0, lastPeriod + 1);
    }

    chunks.push(chunk.trim());
    text = text.slice(chunk.length);
  }

  return chunks;
}

// =======================
// SPEAK CHUNKS
// =======================
function speakChunked(text, options = {}, callback) {
  const chunks = chunkText(text);
  let index = 0;

  function speakNext() {
    if (index >= chunks.length) {
      if (options.tabId) {
        chrome.scripting.executeScript({
          target: { tabId: options.tabId },
          func: () =>
            document.querySelectorAll(".tts-highlight").forEach(el =>
              el.classList.remove("tts-highlight")
            )
        });
      }

      if (typeof callback === "function") callback();
      return;
    }

    const chunk = chunks[index];

    // Highlight
    if (options.tabId) {
      chrome.scripting.executeScript({
        target: { tabId: options.tabId },
        func: (text) => {
          document.querySelectorAll(".tts-highlight").forEach(el =>
            el.classList.remove("tts-highlight")
          );

          const links = Array.from(document.querySelectorAll("a"))
            .filter(a =>
              a.innerText.slice(0, 100).includes(text.slice(0, 50))
            );

          links.forEach(a => a.classList.add("tts-highlight"));
        },
        args: [chunk]
      });
    }

    chrome.tts.speak(chunk, {
      rate: options.rate || 1,
      pitch: options.pitch || 1,
      voiceName: options.voiceName || undefined,
      enqueue: true,
      onEvent(event) {
        if (event.type === "end" || event.type === "error") {
          index++;
          speakNext();
        }
      }
    });
  }

  speakNext();
}

// =======================
// SUMMARIZER
// =======================
function summarizeText(text, metaDescription = "", maxSentences = 5) {
  text = text.replace(/\s+/g, " ").trim();

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  if (metaDescription) {
    sentences.unshift(metaDescription.trim());
  }

  const wordFreq = {};
  text.split(" ").forEach(word => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word) wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const scored = sentences.map(sentence => {
    const words = sentence.split(" ");
    let score = 0;

    words.forEach(word => {
      word = word.toLowerCase().replace(/[^a-z]/g, "");
      if (wordFreq[word]) score += wordFreq[word];
    });

    return { sentence: sentence.trim(), score: score / words.length };
  });

  scored.sort((a, b) => b.score - a.score);

  let summary = scored
    .slice(0, maxSentences)
    .map(s => s.sentence)
    .join(" ");

  if (summary.length < 100) {
    summary = sentences.slice(0, 3).join(" ");
  }

  return summary;
}

// =======================
// GET CLEAN TEXT
// =======================
async function getCleanTextFromTab(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      let main =
        document.querySelector("main") ||
        document.querySelector("article") ||
        document.querySelector('[role="main"]');

      let clone = main ? main.cloneNode(true) : document.body.cloneNode(true);

      clone
        .querySelectorAll(
          "script, style, nav, header, footer, aside, iframe"
        )
        .forEach(el => el.remove());

      return clone.innerText.trim();
    }
  });

  return result.result;
}

// =======================
// GET META DESCRIPTION
// =======================
async function getMetaDescriptionFromTab(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () =>
      document.querySelector('meta[name="description"]')?.content || ""
  });

  return result.result;
}

// =======================
// CONTEXT MENU
// =======================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readSelection") {
    chrome.storage.local.get(["speed", "pitch", "voiceName"], settings => {
      const rate = parseFloat(settings.speed) || 1;
      const pitch = parseFloat(settings.pitch) || 1;
      const voiceName = settings.voiceName || null;

      saveToHistory(info.selectionText, rate, pitch, voiceName, tab?.url, tab?.title);

      speakChunked(info.selectionText, { rate, pitch, voiceName });
    });
  }
});

// =======================
// KEYBOARD SHORTCUTS
// =======================
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.storage.local.get(["speed", "pitch", "voiceName"], async (settings) => {
    const rate = parseFloat(settings.speed) || 1;
    const pitch = parseFloat(settings.pitch) || 1;
    const voiceName = settings.voiceName || null;

    if (command === "read-page") {
      chrome.tts.stop();
      isPaused = false;

      const text = await getCleanTextFromTab(tab.id);

      currentUtterance = { text, rate, pitch, voiceName, tabId: tab.id };
      saveToHistory(text, rate, pitch, voiceName, tab.url, tab.title);

      speakChunked(text, { rate, pitch, voiceName, tabId: tab.id });
    }

    if (command === "summarize-page") {
      chrome.tts.stop();
      isPaused = false;

      const text = await getCleanTextFromTab(tab.id);
      const desc = await getMetaDescriptionFromTab(tab.id);

      const summary = text
        ? `Summary: ${summarizeText(text, desc)}`
        : "No content to summarize.";

      currentUtterance = { text: summary, rate, pitch, voiceName, tabId: tab.id };
      saveToHistory(summary, rate, pitch, voiceName, tab.url, tab.title);

      speakChunked(summary, { rate, pitch, voiceName, tabId: tab.id });
    }

    if (command === "stop-tts") {
      chrome.tts.stop();
      currentUtterance = null;
      isPaused = false;
    }

    if (command === "pause-resume-tts") {
      if (!currentUtterance) return;

      if (isPaused) {
        chrome.tts.resume();
      } else {
        chrome.tts.pause();
      }

      isPaused = !isPaused;
    }
  });
});

// =======================
// MESSAGE LISTENER
// =======================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  chrome.storage.local.get(["speed", "pitch", "voiceName"], (settings) => {
    const rate = parseFloat(settings.speed) || 1;
    const pitch = parseFloat(settings.pitch) || 1;
    const voiceName = settings.voiceName || null;
    const tabId = sender.tab?.id;

    if (msg.action === "readText") {
      chrome.tts.stop();
      isPaused = false;

      const text = msg.text.trim();

      currentUtterance = { text, rate, pitch, voiceName, tabId };
      saveToHistory(text, rate, pitch, voiceName, sender.tab?.url, sender.tab?.title);

      speakChunked(text, { rate, pitch, voiceName, tabId });
      sendResponse({ ok: true });
    }

    if (msg.action === "summarizeText") {
      chrome.tts.stop();
      isPaused = false;

      const text = msg.text.trim();
      const summary = text
        ? `Summary: ${summarizeText(text, msg.description)}`
        : "No content to summarize.";

      currentUtterance = { text: summary, rate, pitch, voiceName, tabId };
      saveToHistory(summary, rate, pitch, voiceName, sender.tab?.url, sender.tab?.title);

      speakChunked(summary, { rate, pitch, voiceName, tabId });
      sendResponse({ ok: true });
    }

    if (msg.action === "stopTTS") {
      chrome.tts.stop();
      currentUtterance = null;
      isPaused = false;
      sendResponse({ ok: true });
    }

    if (msg.action === "pauseTTS") {
      chrome.tts.pause();
      isPaused = true;
      sendResponse({ ok: true });
    }

    if (msg.action === "resumeTTS") {
      chrome.tts.resume();
      isPaused = false;
      sendResponse({ ok: true });
    }

    if (msg.action === "updateTTS") {
      if (!currentUtterance) return;

      chrome.tts.stop();

      speakChunked(currentUtterance.text, {
        rate: msg.speed || rate,
        pitch: msg.pitch || pitch,
        voiceName,
        tabId: currentUtterance.tabId
      });

      isPaused = false;
      sendResponse({ ok: true });
    }

    if (msg.action === "updateVoice") {
      if (!currentUtterance) return;

      chrome.tts.stop();

      speakChunked(currentUtterance.text, {
        rate,
        pitch,
        voiceName: msg.voiceName,
        tabId: currentUtterance.tabId
      });

      isPaused = false;
      sendResponse({ ok: true });
    }

    if (msg.action === "playHistoryItem") {
      speakChunked(msg.text, { rate, pitch, voiceName });
      sendResponse({ ok: true });
    }
  });

  return true;
});