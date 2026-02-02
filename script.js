// ===============================
// CONFIG
// ===============================
const examConfig = {
  SSC: {
    time: 15 * 60,
    minKDPH: 8000
  },
  CHSL: {
    time: 10 * 60,
    minKDPH: 9000
  },
  CPO: {
    time: 10 * 60,
    minKDPH: 7500
  }
};

// ===============================
// VARIABLES
// ===============================
let timer = null;
let timeLeft = 0;
let started = false;
let mistakes = 0;
let backspaceCount = 0;
let typedChars = 0;

// ===============================
// ELEMENTS
// ===============================
const examSelect = document.getElementById("examSelect");
const timeDisplay = document.getElementById("time");
const inputBox = document.getElementById("input");
const paraBox = document.getElementById("paragraph");
const restartBtn = document.getElementById("restart");

// ===============================
// LOAD PARAGRAPH
// ===============================
let paragraphText = "";

fetch("paragraphs.json")
  .then(res => res.json())
  .then(data => {
    paragraphText = data[0];
    paraBox.innerText = paragraphText;
  });

// ===============================
// TIMER FUNCTIONS
// ===============================
function setTimeByExam() {
  clearInterval(timer);
  started = false;
  const exam = examSelect.value;
  timeLeft = examConfig[exam].time;
  updateTimeUI();
}

function updateTimeUI() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timeDisplay.innerText = `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function startTimer() {
  if (started) return;
  started = true;

  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      inputBox.disabled = true;
      showResult();
      return;
    }
    timeLeft--;
    updateTimeUI();
  }, 1000);
}

// ===============================
// TYPING LOGIC
// ===============================
inputBox.addEventListener("input", (e) => {
  startTimer();

  const value = inputBox.value;
  typedChars++;

  if (
    value[value.length - 1] !==
    paragraphText[value.length - 1]
  ) {
    mistakes++;
  }
});

inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") {
    backspaceCount++;
  }
});

// ===============================
// RESULT
// ===============================
function showResult() {
  const exam = examSelect.value;
  const timeSpent = examConfig[exam].time;
  const kdpH = Math.round((typedChars * 3600) / timeSpent);

  alert(
    `RESULT\n\n` +
    `KDPH: ${kdpH}\n` +
    `Mistakes: ${mistakes}\n` +
    `Backspace: ${backspaceCount}\n\n` +
    (kdpH >= examConfig[exam].minKDPH
      ? "QUALIFIED ✅"
      : "NOT QUALIFIED ❌")
  );
}

// ===============================
// EVENTS
// ===============================
examSelect.addEventListener("change", setTimeByExam);
restartBtn.addEventListener("click", () => location.reload());

// ===============================
// INIT
// ===============================
setTimeByExam();
