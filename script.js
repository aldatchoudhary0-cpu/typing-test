/* =========================
   CONFIG (DAY-3 LOCK)
========================= */
const EXAMS = {
  ssc: {
    key: "ssc_cgl",
    time: 15 * 60,
    minKDPH: 8000,
    backspaceAllowed: true,
    evaluation: "SSC_DEST"
  }
};

/* =========================
   DOM
========================= */
const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const timeEl = document.getElementById("time");

const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const misEl = document.getElementById("mistakes");
const bsUsedEl = document.getElementById("bsUsed");

const restartBtn = document.getElementById("restart");
const resultBox = document.getElementById("resultBox");

const finalWpmEl = document.getElementById("finalWpm");
const finalAccEl = document.getElementById("finalAcc");
const finalMisEl = document.getElementById("finalMistakes");
const finalBsEl = document.getElementById("finalBs");

const statusEl = document.getElementById("status");
const examRuleEl = document.getElementById("examRule");

const examSelect = document.getElementById("exam");
const modeRadios = document.querySelectorAll("input[name='mode']");
const typingAmbience = document.getElementById("typingAmbience");

/* =========================
   STATE
========================= */
let PARAGRAPHS = {};
let paragraphText = "";
let time = 0;
let interval = null;
let testStarted = false;
let mode = "practice";
let backspaceUsed = 0;
let correctKeyPress = 0;

/* =========================
   INIT
========================= */
loadParagraphs().then(resetTest);

/* =========================
   LOAD PARAGRAPHS (JSON)
========================= */
async function loadParagraphs() {
  const res = await fetch("data/paragraphs.json");
  PARAGRAPHS = await res.json();
}

function pickRandomParagraph() {
  const examKey = EXAMS.ssc.key;
  const list = PARAGRAPHS[examKey];
  const rand = Math.floor(Math.random() * list.length);
  paragraphText = list[rand].text;
}

/* =========================
   MODE CHANGE
========================= */
modeRadios.forEach(r => {
  r.addEventListener("change", () => {
    mode = r.value;
    renderParagraph();
  });
});

/* =========================
   SECURITY
========================= */
["copy","cut","paste"].forEach(evt =>
  document.addEventListener(evt, e => e.preventDefault())
);

/* =========================
   EVENTS
========================= */
examSelect.addEventListener("change", resetTest);
restartBtn.addEventListener("click", resetTest);

inputEl.addEventListener("keydown", e => {
  if (mode === "exam" && testStarted) {
    examSelect.disabled = true;
    modeRadios.forEach(r => r.disabled = true);
    restartBtn.disabled = true;
  }
  if (e.key === "Backspace" && mode === "exam") {
    backspaceUsed++;
    bsUsedEl.textContent = backspaceUsed;
  }
});

inputEl.addEventListener("input", () => {
  if (!testStarted) startTest();

  const chars = paragraphEl.querySelectorAll("span");
  const typed = inputEl.value;

  correctKeyPress = 0;
  let mistakes = 0;

  chars.forEach((span, i) => {
    span.className = "";
    if (typed[i] == null) return;

    if (typed[i] === span.innerText) {
      correctKeyPress++;
      if (mode === "practice") span.classList.add("correct");
    } else {
      mistakes++;
      if (mode === "practice") span.classList.add("wrong");
    }
  });

  if (mode === "practice" && chars[typed.length]) {
    chars[typed.length].classList.add("current");
  }

  calculateStats(false);

  if (mode === "exam" && time <= 0) endTest();
});

/* =========================
   RENDER
========================= */
function renderParagraph() {
  paragraphEl.innerHTML = "";
  paragraphText.split("").forEach(ch => {
    const span = document.createElement("span");
    span.innerText = ch;
    paragraphEl.appendChild(span);
  });
}

/* =========================
   TIMER
========================= */
function startTest() {
  testStarted = true;
 // typingAmbience.play();

  interval = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 0) endTest();
  }, 1000);
}

/* =========================
   END TEST
========================= */
function endTest() {
  clearInterval(interval);
  inputEl.disabled = true;
  //typingAmbience.pause();

  examSelect.disabled = false;
  modeRadios.forEach(r => r.disabled = false);
  restartBtn.disabled = false;

  calculateStats(true);
  resultBox.classList.remove("hidden");
}

/* =========================
   STATS (SSC DEST)
========================= */
function calculateStats(final) {
  const typed = inputEl.value;
  let mistakes = Math.max(typed.length - correctKeyPress, 0);

  const elapsed = (EXAMS.ssc.time - time) || 1;
  const kdph = Math.round((correctKeyPress * 3600) / elapsed);

  wpmEl.textContent = Math.round((typed.length / 5) / (elapsed / 60));
  accEl.textContent = typed.length ? Math.round((correctKeyPress / typed.length) * 100) : 0;
  misEl.textContent = mistakes;

  if (!final) return;

  finalWpmEl.textContent = wpmEl.textContent;
  finalAccEl.textContent = accEl.textContent;
  finalMisEl.textContent = mistakes;
  finalBsEl.textContent = backspaceUsed;

  examRuleEl.innerText = "SSC CGL DEST | 15 Min | Min 8000 KDPH | Qualifying";

  const pass = kdph >= EXAMS.ssc.minKDPH;
  statusEl.innerText = pass ? "QUALIFIED ✅" : "NOT QUALIFIED ❌";
  statusEl.className = pass ? "status-pass" : "status-fail";
}

/* =========================
   RESET
========================= */
function resetTest() {
  clearInterval(interval);
  interval = null;
  testStarted = false;
  backspaceUsed = 0;
  correctKeyPress = 0;

  pickRandomParagraph();

  time = EXAMS.ssc.time;
  timeEl.textContent = time;
  bsUsedEl.textContent = 0;

  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();

  resultBox.classList.add("hidden");
  renderParagraph();
}