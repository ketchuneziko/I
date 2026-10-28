/* Жасырын сөз — ойын */
(function () {
  "use strict";

  // Жасырын сөз (жауап). Ойын барысында экранда көрінбейді.
  var WORD = "ҒАЛАМТОР";
  var MAX_MISTAKES = 7;
  var ALPHABET = "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ".split("");

  var wordEl = document.getElementById("word");
  var statusEl = document.getElementById("status");
  var keyboardEl = document.getElementById("keyboard");
  var mistakeEl = document.getElementById("mistakeCount");
  var tallyEl = document.getElementById("tally");
  var restartBtn = document.getElementById("restart");
  var gallowsEl = document.querySelector(".gallows");
  var parts = document.querySelectorAll(".gallows .part");
  var yearEl = document.getElementById("year");

  var guessed = [];
  var mistakes = 0;
  var over = false;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Пернетақта ---------- */
  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    ALPHABET.forEach(function (letter) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.setAttribute("aria-label", letter + " әрпі");
      btn.addEventListener("click", function () { guess(letter); });
      keyboardEl.appendChild(btn);
    });
  }

  /* ---------- Сөз шаршылары ---------- */
  function renderWord() {
    wordEl.innerHTML = "";
    WORD.split("").forEach(function (letter) {
      var slot = document.createElement("span");
      slot.className = "slot";
      slot.dataset.letter = letter;
      if (guessed.indexOf(letter) !== -1) {
        slot.textContent = letter;
        slot.classList.add("open");
      }
      wordEl.appendChild(slot);
    });
  }

  /* ---------- Дар және қате санағы ---------- */
  function renderGallows() {
    parts.forEach(function (part, i) {
      part.classList.toggle("on", i < mistakes);
    });
    gallowsEl.classList.toggle("dead", mistakes >= MAX_MISTAKES);
  }

  function renderTally() {
    tallyEl.innerHTML = "";
    for (var i = 0; i < MAX_MISTAKES; i++) {
      var mark = document.createElement("span");
      if (i < mistakes) mark.className = "used";
      tallyEl.appendChild(mark);
    }
    mistakeEl.textContent = mistakes;
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function isSolved() {
    return WORD.split("").every(function (ch) {
      return guessed.indexOf(ch) !== -1;
    });
  }

  /* ---------- Жүріс ---------- */
  function guess(letter) {
    if (over || guessed.indexOf(letter) !== -1) return;
    guessed.push(letter);

    var btn = keyboardEl.querySelector('[data-letter="' + letter + '"]');
    var correct = WORD.indexOf(letter) !== -1;

    if (correct) {
      if (btn) btn.classList.add("good");
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        if (slot.dataset.letter === letter) {
          slot.textContent = letter;
          slot.classList.add("open");
        }
      });
      setStatus("«" + letter + "» әрпі дұрыс!");
    } else {
      mistakes += 1;
      if (btn) btn.classList.add("bad");
      renderGallows();
      renderTally();
      setStatus("«" + letter + "» әрпі жоқ. Қате: " + mistakes + " / " + MAX_MISTAKES);
    }

    if (btn) btn.disabled = true;

    if (isSolved()) return finish(true);
    if (mistakes >= MAX_MISTAKES) return finish(false);
  }

  /* ---------- Аяқтау ---------- */
  function finish(win) {
    over = true;
    Array.prototype.forEach.call(keyboardEl.children, function (btn) { btn.disabled = true; });

    if (win) {
      wordEl.classList.add("win");
      Array.prototype.forEach.call(wordEl.children, function (slot, i) {
        slot.textContent = slot.dataset.letter;
        slot.classList.add("open");
        slot.style.animationDelay = (i * 60) + "ms";
      });
      setStatus("Жеңіс! Сөзді таптыңыз 🎉", "win");
    } else {
      wordEl.classList.add("lose");
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        slot.textContent = slot.dataset.letter;
        slot.classList.add("open");
      });
      setStatus("Ойын аяқталды. Дұрыс сөз жоғарыда ашылды.", "lose");
    }

    restartBtn.hidden = false;
  }

  /* ---------- Қайта бастау ---------- */
  function start() {
    guessed = [];
    mistakes = 0;
    over = false;

    wordEl.className = "word";
    renderWord();
    renderGallows();
    renderTally();
    setStatus("Сөзді табу үшін әріп таңдаңыз.", "");

    Array.prototype.forEach.call(keyboardEl.children, function (btn) {
      btn.disabled = false;
      btn.classList.remove("good", "bad");
    });

    restartBtn.hidden = true;
  }

  restartBtn.addEventListener("click", start);

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter" && over) { start(); return; }
    var key = e.key.toUpperCase();
    if (key.length !== 1 || ALPHABET.indexOf(key) === -1) return;
    e.preventDefault();
    guess(key);
  });

  buildKeyboard();
  start();
})();
