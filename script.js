/* Виселица — Ғаламтор */
(function () {
  "use strict";

  var WORD = "ҒАЛАМТОР";
  var MAX_MISTAKES = 7;
  var ALPHABET = "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ".split("");

  var wordEl = document.getElementById("word");
  var statusEl = document.getElementById("status");
  var keyboardEl = document.getElementById("keyboard");
  var mistakeEl = document.getElementById("mistakeCount");
  var restartBtn = document.getElementById("restart");
  var gallowsEl = document.querySelector(".gallows");
  var parts = document.querySelectorAll(".gallows .part");
  var yearEl = document.getElementById("year");

  var guessed = [];
  var mistakes = 0;
  var over = false;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  function renderGallows() {
    parts.forEach(function (part, i) {
      part.classList.toggle("on", i < mistakes);
    });
    gallowsEl.classList.toggle("dead", mistakes >= MAX_MISTAKES);
  }

  function renderMistakes() {
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

  function guess(letter) {
    if (over || guessed.indexOf(letter) !== -1) return;
    guessed.push(letter);

    var btn = keyboardEl.querySelector('[data-letter="' + letter + '"]');
    var correct = WORD.indexOf(letter) !== -1;

    if (correct) {
      if (btn) btn.classList.add("good");
      setStatus("«" + letter + "» әрпі дұрыс.");
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        if (slot.dataset.letter === letter) {
          slot.textContent = letter;
          slot.classList.add("open");
        }
      });
    } else {
      mistakes += 1;
      if (btn) btn.classList.add("bad");
      renderGallows();
      renderMistakes();
      setStatus("«" + letter + "» әрпі жоқ.");
    }

    if (btn) btn.disabled = true;

    if (isSolved()) return finish(true);
    if (mistakes >= MAX_MISTAKES) return finish(false);
  }

  function finish(win) {
    over = true;
    Array.prototype.forEach.call(keyboardEl.children, function (btn) { btn.disabled = true; });

    if (win) {
      wordEl.classList.add("win");
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        slot.textContent = slot.dataset.letter;
        slot.classList.add("open");
      });
      setStatus("Жеңіс! Сөз: " + WORD, "win");
    } else {
      wordEl.classList.add("lose");
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        slot.textContent = slot.dataset.letter;
        if (!slot.classList.contains("open")) slot.classList.add("open");
      });
      setStatus("Ойын аяқталды. Дұрыс сөз: " + WORD, "lose");
    }

    restartBtn.hidden = false;
  }

  function start() {
    guessed = [];
    mistakes = 0;
    over = false;

    wordEl.className = "word";
    renderWord();
    renderGallows();
    renderMistakes();
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
