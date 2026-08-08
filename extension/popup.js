// =========================
// ELEMENT REFERENCES
// =========================
const readBtn = document.getElementById("readPage");
const stopBtn = document.getElementById("stop");
const pauseResumeBtn = document.getElementById("pauseResume");
const speedInput = document.getElementById("speed");
const speedVal = document.getElementById("speedVal");
const pitchInput = document.getElementById("pitch");
const pitchVal = document.getElementById("pitchVal");
const contrastInput = document.getElementById("contrast");
const contrastVal = document.getElementById("contrastVal");
const colorFilterInput =
  document.getElementById("colorFilter");
const themeToggle =
  document.getElementById("themeToggle");
const voiceSelect =
  document.getElementById("voiceSelect");
const resetSelect =
  document.getElementById("resetSelect");
const resetAllBtn =
  document.getElementById("resetAllBtn");
const openHistoryBtn =
  document.getElementById("openHistory");
const openDashboard =
  document.getElementById("openDashboard");
const summarizeBtn =
  document.getElementById("summarizePage");
const openFeedbackPage =
  document.getElementById(
    "openFeedbackPage"
  );

// =========================
// VOICE ASSISTANT
// =========================
const voiceAssistantBtn =
  document.getElementById(
    "voiceAssistant"
  );

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

// CHECK SUPPORT
if (!SpeechRecognition) {

  console.log(
    "Speech Recognition not supported"
  );

  alert(
    "Voice recognition is not supported in this browser."
  );
}

const recognition =
  new SpeechRecognition();

recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isPaused = false;
let isListening = false;

// =========================
// SPEAK RESPONSE
// =========================
function speakResponse(text) {

  chrome.tts.stop();

  chrome.tts.speak(text, {
    rate: parseFloat(speedInput.value),
    pitch: parseFloat(pitchInput.value),
    voiceName:
      voiceSelect.value || undefined,
  });
}

// =========================
// LOAD SAVED SETTINGS
// =========================
chrome.storage.local.get(
  [
    "speed",
    "pitch",
    "contrast",
    "colorFilter",
    "darkMode",
    "voiceName",
  ],
  (data) => {

    speedInput.value =
      data.speed || 1;

    pitchInput.value =
      data.pitch || 1;

    contrastInput.value =
      data.contrast || 100;

    colorFilterInput.value =
      data.colorFilter || "none";

    speedVal.innerText =
      speedInput.value + "x";

    pitchVal.innerText =
      pitchInput.value + "x";

    contrastVal.innerText =
      contrastInput.value + "%";

    if (data.darkMode) {

      themeToggle.checked = true;

      document.body.classList.add(
        "dark"
      );
    }

    if (data.voiceName) {

      voiceSelect.value =
        data.voiceName;
    }
  }
);

// =========================
// READ PAGE CONTENT
// =========================
readBtn.addEventListener(
  "click",
  () => {

    isPaused = false;

    pauseResumeBtn.innerHTML =
      '<i class="fas fa-pause"></i> Pause';

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {

        if (!tab) return;

        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },

          func: () => {

            function getCleanText() {

              let main =
                document.querySelector(
                  "main"
                ) ||
                document.querySelector(
                  "article"
                ) ||
                document.querySelector(
                  '[role="main"]'
                );

              let clone = main
                ? main.cloneNode(true)
                : document.body.cloneNode(
                    true
                  );

              clone
                .querySelectorAll(
                  "script, style, nav, header, footer, aside, iframe"
                )
                .forEach((el) =>
                  el.remove()
                );

              return clone.innerText.trim();
            }

            chrome.runtime.sendMessage({
              action: "readText",
              text: getCleanText(),
            });
          },
        });
      }
    );
  }
);

// =========================
// STOP TTS
// =========================
stopBtn.addEventListener(
  "click",
  () => {

    chrome.runtime.sendMessage({
      action: "stopTTS",
    });

    isPaused = false;

    pauseResumeBtn.innerHTML =
      '<i class="fas fa-pause"></i> Pause';
  }
);

// =========================
// PAUSE / RESUME
// =========================
pauseResumeBtn.addEventListener(
  "click",
  () => {

    if (!isPaused) {

      chrome.runtime.sendMessage({
        action: "pauseTTS",
      });

      pauseResumeBtn.innerHTML =
        '<i class="fas fa-play"></i> Resume';

      isPaused = true;

    } else {

      chrome.runtime.sendMessage({
        action: "resumeTTS",
      });

      pauseResumeBtn.innerHTML =
        '<i class="fas fa-pause"></i> Pause';

      isPaused = false;
    }
  }
);

// =========================
// TTS SETTINGS
// =========================
function updateTTSSettings() {

  chrome.runtime.sendMessage({
    action: "updateTTS",

    speed: parseFloat(
      speedInput.value
    ),

    pitch: parseFloat(
      pitchInput.value
    ),
  });
}

speedInput.addEventListener(
  "input",
  (e) => {

    speedVal.innerText =
      e.target.value + "x";

    chrome.storage.local.set({
      speed: e.target.value,
    });

    updateTTSSettings();
  }
);

pitchInput.addEventListener(
  "input",
  (e) => {

    pitchVal.innerText =
      e.target.value + "x";

    chrome.storage.local.set({
      pitch: e.target.value,
    });

    updateTTSSettings();
  }
);

// =========================
// CONTRAST
// =========================
contrastInput.addEventListener(
  "input",
  (e) => {

    const value = e.target.value;

    contrastVal.innerText =
      value + "%";

    chrome.storage.local.set({
      contrast: value,
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {

        if (!tab) return;

        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },

          func: (v) => {

            document.body.style.filter =
              `contrast(${v}%)`;
          },

          args: [value],
        });
      }
    );
  }
);

// =========================
// COLOR FILTER
// =========================
colorFilterInput.addEventListener(
  "change",
  (e) => {

    const value = e.target.value;

    chrome.storage.local.set({
      colorFilter: value,
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {

        if (!tab) return;

        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },

          func: (v) => {

            document.body.style.filter =
              v;
          },

          args: [value],
        });
      }
    );
  }
);

// =========================
// DARK MODE
// =========================
themeToggle.addEventListener(
  "change",
  () => {

    const isDark =
      themeToggle.checked;

    document.body.classList.toggle(
      "dark",
      isDark
    );

    chrome.storage.local.set({
      darkMode: isDark,
    });
  }
);

// =========================
// LOAD VOICES
// =========================
chrome.tts.getVoices(
  (voices) => {

    voiceSelect.innerHTML = "";

    voices.forEach((v) => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        v.voiceName;

      option.textContent =
        `${v.voiceName} (${v.lang})`;

      voiceSelect.appendChild(
        option
      );
    });

    chrome.storage.local.get(
      "voiceName",
      (data) => {

        if (data.voiceName) {

          voiceSelect.value =
            data.voiceName;
        }
      }
    );
  }
);

voiceSelect.addEventListener(
  "change",
  (e) => {

    chrome.storage.local.set({
      voiceName:
        e.target.value,
    });

    chrome.runtime.sendMessage({
      action: "updateVoice",

      voiceName:
        e.target.value,
    });
  }
);

// =========================
// RESET BUTTONS
// =========================
resetAllBtn.addEventListener(
  "click",
  () => {

    speedInput.value = 1;
    pitchInput.value = 1;
    contrastInput.value = 100;
    colorFilterInput.value =
      "none";

    speedVal.innerText = "1x";
    pitchVal.innerText = "1x";
    contrastVal.innerText =
      "100%";

    chrome.storage.local.set({
      speed: 1,
      pitch: 1,
      contrast: 100,
      colorFilter: "none",
      voiceName: null,
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {

        if (!tab) return;

        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },

          func: () => {

            document.body.style.filter =
              "none";
          },
        });
      }
    );

    updateTTSSettings();

    chrome.runtime.sendMessage({
      action: "updateVoice",
      voiceName: null,
    });
  }
);

// =========================
// RESET SELECT
// =========================
resetSelect.addEventListener(
  "change",
  () => {

    const type =
      resetSelect.value;

    if (!type) return;

    if (type === "speed") {

      speedInput.value = 1;

      speedVal.innerText =
        "1x";

      chrome.storage.local.set({
        speed: 1,
      });
    }

    if (type === "pitch") {

      pitchInput.value = 1;

      pitchVal.innerText =
        "1x";

      chrome.storage.local.set({
        pitch: 1,
      });
    }

    if (type === "contrast") {

      contrastInput.value = 100;

      contrastVal.innerText =
        "100%";

      chrome.storage.local.set({
        contrast: 100,
      });
    }

    if (
      type === "colorFilter"
    ) {

      colorFilterInput.value =
        "none";

      chrome.storage.local.set({
        colorFilter: "none",
      });
    }

    if (type === "voice") {

      chrome.storage.local.set({
        voiceName: null,
      });

      chrome.runtime.sendMessage({
        action: "updateVoice",
        voiceName: null,
      });
    }

    resetSelect.value = "";
  }
);

// =========================
// NAVIGATION
// =========================
openHistoryBtn.addEventListener(
  "click",
  () => {

    chrome.tabs.create({
      url:
        chrome.runtime.getURL(
          "history.html"
        ),
    });
  }
);

openDashboard.addEventListener(
  "click",
  () => {

    chrome.tabs.create({
      url:
       "https://enamsosu.github.io/Voxa/dashboard/dashboard.html"
    });
  }
);

openFeedbackPage.addEventListener(
  "click",
  () => {

    chrome.tabs.create({
      url:
        "https://enamsosu.github.io/Voxa/feedback/feedback.html"
    });
  }
);

// =========================
// SUMMARIZE PAGE
// =========================
summarizeBtn.addEventListener(
  "click",
  () => {

    isPaused = false;

    pauseResumeBtn.innerHTML =
      '<i class="fas fa-pause"></i> Pause';

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      ([tab]) => {

        if (!tab) return;

        chrome.scripting.executeScript({
          target: {
            tabId: tab.id,
          },

          func: () => {

            const text =
              document.body.innerText;

            const description =
              document.querySelector(
                'meta[name="description"]'
              )?.content || "";

            chrome.runtime.sendMessage({
              action:
                "summarizeText",

              text,
              description,
            });
          },
        });
      }
    );
  }
);

// =========================
// THUMBS UP & DOWN
// =========================
const thumbUpBtn =
  document.getElementById(
    "thumbUp"
  );

const thumbDownBtn =
  document.getElementById(
    "thumbDown"
  );

thumbUpBtn.addEventListener(
  "click",
  () => {

    showToast(
      "Thanks for your positive feedback 👍"
    );

    thumbUpBtn.classList.add(
      "active"
    );

    thumbDownBtn.classList.remove(
      "active"
    );
  }
);

thumbDownBtn.addEventListener(
  "click",
  () => {

    showToast(
      "Thanks for your feedback 👎"
    );

    thumbDownBtn.classList.add(
      "active"
    );

    thumbUpBtn.classList.remove(
      "active"
    );
  }
);

// =========================
// TOAST
// =========================
function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) return;

  toast.textContent = message;

  toast.classList.remove(
    "hidden"
  );

  toast.classList.add("show");

  clearTimeout(
    window.toastTimer
  );

  window.toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

      toast.classList.add(
        "hidden"
      );

    }, 2000);
}

// =========================
// START VOICE ASSISTANT
// =========================
voiceAssistantBtn.addEventListener(
  "click",
  async () => {

    if (isListening) return;

    try {

      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      recognition.start();

      isListening = true;

      showToast(
        "Listening..."
      );

      speakResponse(
        "Voice assistant activated."
      );

    } catch (err) {

      console.log(err);

      showToast(
        "Microphone access denied"
      );

      speakResponse(
        "Please allow microphone access."
      );
    }
  }
);

// =========================
// RECOGNITION START
// =========================
recognition.onstart = () => {

  isListening = true;

  console.log(
    "Voice recognition started"
  );
};

// =========================
// RECOGNITION END
// =========================
recognition.onend = () => {

  isListening = false;

  console.log(
    "Voice recognition ended"
  );
};

// =========================
// VOICE COMMANDS
// =========================
recognition.onresult = (
  event
) => {

  const command =
    event.results[0][0]
      .transcript
      .toLowerCase();

  console.log(
    "Voice Command:",
    command
  );

  if (
    command.includes(
      "read page"
    ) ||
    command.includes(
      "start reading"
    )
  ) {

    readBtn.click();

    speakResponse(
      "Reading page now."
    );
  }

  else if (
    command.includes(
      "stop reading"
    ) ||
    command === "stop"
  ) {

    stopBtn.click();

    speakResponse(
      "Stopped reading."
    );
  }

  else if (
    command.includes(
      "pause"
    )
  ) {

    if (!isPaused) {

      pauseResumeBtn.click();
    }

    speakResponse(
      "Reading paused."
    );
  }

  else if (
    command.includes(
      "resume"
    )
  ) {

    if (isPaused) {

      pauseResumeBtn.click();
    }

    speakResponse(
      "Reading resumed."
    );
  }

  else if (
    command.includes(
      "summarize"
    ) ||
    command.includes(
      "summary"
    )
  ) {

    summarizeBtn.click();

    speakResponse(
      "Summarizing page."
    );
  }

  else if (
    command.includes(
      "dark mode"
    )
  ) {

    themeToggle.checked = true;

    document.body.classList.add(
      "dark"
    );

    chrome.storage.local.set({
      darkMode: true,
    });

    speakResponse(
      "Dark mode enabled."
    );
  }

  else if (
    command.includes(
      "light mode"
    )
  ) {

    themeToggle.checked = false;

    document.body.classList.remove(
      "dark"
    );

    chrome.storage.local.set({
      darkMode: false,
    });

    speakResponse(
      "Light mode enabled."
    );
  }

  else if (
    command.includes(
      "open history"
    )
  ) {

    openHistoryBtn.click();

    speakResponse(
      "Opening history."
    );
  }

  else if (
    command.includes(
      "open dashboard"
    )
  ) {

    openDashboard.click();

    speakResponse(
      "Opening dashboard."
    );
  }

  else if (
    command.includes(
      "reset settings"
    )
  ) {

    resetAllBtn.click();

    speakResponse(
      "Settings reset."
    );
  }

  else {

    speakResponse(
      "Sorry, I did not understand that command."
    );
  }
};

// =========================
// VOICE ERRORS
// =========================
recognition.onerror = (
  event
) => {

  console.log(
    "Speech Recognition Error:",
    event.error
  );

  isListening = false;

  if (
    event.error ===
    "not-allowed"
  ) {

    showToast(
      "Microphone permission blocked"
    );

    speakResponse(
      "Please allow microphone access in Chrome settings."
    );
  }

  else if (
    event.error ===
    "no-speech"
  ) {

    showToast(
      "No speech detected"
    );
  }

  else if (
    event.error ===
    "audio-capture"
  ) {

    showToast(
      "Microphone not detected"
    );

    speakResponse(
      "No microphone was found."
    );
  }

  else {

    showToast(
      "Voice assistant error"
    );

    speakResponse(
      "There was a problem with voice recognition."
    );
  }
};