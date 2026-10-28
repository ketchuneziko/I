/* «Ғаламтор» — Виселица ойыны (қазақ тілінде) */
(function () {
  "use strict";

  /* ---------- Қазақ әліпбиі ---------- */
  var ALPHABET = "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ".split("");

  /* ---------- Сөздер ---------- */
  // ҒАЛАМТОР — ойынның негізгі сөзі, әр ойын осыдан басталады.
  var WORDS = [
    { word: "ҒАЛАМТОР", hint: "Бүкіл әлемді байланыстыратын цифрлық желі" },
    { word: "ҒАРЫШ", hint: "Жерді айналатын шексіз кеңістік" },
    { word: "КОМПЬЮТЕР", hint: "Ақпаратты өңдейтін электрондық машина" },
    { word: "ТЕЛЕФОН", hint: "Қашықтан сөйлесуге арналған құрылғы" },
    { word: "КІТАП", hint: "Білімнің қайнар көзі" },
    { word: "АЛМАТЫ", hint: "Қазақстанның оңтүстік астанасы" },
    { word: "ДОМБЫРА", hint: "Қазақтың ұлттық музыкалық аспабы" },
    { word: "БАЙТЕРЕК", hint: "Астанадағы символдық мұнара" },
    { word: "ҚАЗАҚСТАН", hint: "Біздің Отанымыз" },
    { word: "ЖҰЛДЫЗ", hint: "Түнгі аспандағы жарық нүкте" },
    { word: "ЕРТЕГІ", hint: "Балаларға арналған сиқырлы әңгіме" },
    { word: "БАҚЫТ", hint: "Адамның ең үлкен қалауы" }
  ];

  var MAX_MISTAKES = 6;

  /* ---------- Күй ---------- */
  var state = {
    index: 0,
    word: "",
    guessed: [],
    mistakes: 0,
    over: false
  };

  var stats = { wins: 0, losses: 0, streak: 0 };

  /* ---------- DOM ---------- */
  var wordEl = document.getElementById("word");
  var hintEl = document.getElementById("hint");
  var messageEl = document.getElementById("message");
  var keyboardEl = document.getElementById("keyboard");
  var livesEl = document.getElementById("lives");
  var captionEl = document.getElementById("gallowsCaption");
  var gallowsEl = document.querySelector(".gallows");
  var parts = document.querySelectorAll(".gallows .part");
  var eyes = document.querySelectorAll(".gallows .eye");
  var nextBtn = document.getElementById("nextBtn");
  var restartBtn = document.getElementById("restartBtn");
  var resetStatsBtn = document.getElementById("resetStatsBtn");
  var statWins = document.getElementById("statWins");
  var statLosses = document.getElementById("statLosses");
  var statStreak = document.getElementById("statStreak");
  var yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Есеп ---------- */
  var STORAGE_KEY = "galamtor-hangman-stats";

  function loadStats() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      stats.wins = Number(parsed.wins) || 0;
      stats.losses = Number(parsed.losses) || 0;
      stats.streak = Number(parsed.streak) || 0;
    } catch (e) {
      /* localStorage қолжетімсіз болса — елемейміз */
    }
  }

  function saveStats() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      /* елемейміз */
    }
  }

  function renderStats() {
    if (statWins) statWins.textContent = stats.wins;
    if (statLosses) statLosses.textContent = stats.losses;
    if (statStreak) statStreak.textContent = stats.streak;
  }

  /* ---------- Пернетақта құру ---------- */
  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    ALPHABET.forEach(function (letter) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key";
      btn.dataset.letter = letter;
      btn.textContent = letter;
      btn.setAttribute("aria-label", letter + " әрпі");
      btn.addEventListener("click", function () {
        guess(letter);
      });
      keyboardEl.appendChild(btn);
    });
  }

  /* ---------- Мүмкіндіктер ---------- */
  function renderLives() {
    livesEl.innerHTML = "";
    for (var i = 0; i < MAX_MISTAKES; i++) {
      var span = document.createElement("span");
      span.textContent = "✕";
      if (i < state.mistakes) span.classList.add("used");
      livesEl.appendChild(span);
    }
    var left = MAX_MISTAKES - state.mistakes;
    captionEl.innerHTML = "Мүмкіндік: <b>" + left + "</b> / " + MAX_MISTAKES;
    if (gallowsEl) gallowsEl.classList.toggle("danger", left <= 2);
  }

  /* ---------- Сөзді көрсету ---------- */
  function renderWord(revealed) {
    wordEl.innerHTML = "";
    wordEl.className = "word";
    state.word.split("").forEach(function (letter) {
      var slot = document.createElement("span");
      slot.className = "slot";
      slot.dataset.letter = letter;

      var isOpen = revealed || state.guessed.indexOf(letter) !== -1;
      if (isOpen) {
        slot.textContent = letter;
        slot.classList.add("open");
        if (state.over && state.mistakes >= MAX_MISTAKES) slot.classList.add("reveal");
      }
      wordEl.appendChild(slot);
    });
  }

  /* ---------- Виселица бөліктері ---------- */
  function renderGallows() {
    parts.forEach(function (part, i) {
      part.classList.toggle("on", i < state.mistakes);
    });
    var showFace = state.mistakes >= MAX_MISTAKES;
    eyes.forEach(function (eye) {
      eye.classList.toggle("on", showFace);
    });
  }

  /* ---------- Ойынды бастау ---------- */
  function startRound(index) {
    state.index = typeof index === "number" ? index : state.index;
    var item = WORDS[state.index % WORDS.length];
    state.word = item.word;
    state.guessed = [];
    state.mistakes = 0;
    state.over = false;

    if (hintEl) hintEl.textContent = item.hint;
    if (messageEl) {
      messageEl.textContent = state.index === 0
        ? "ҒАЛАМТОР сөзін тауып көріңіз!"
        : "Жаңа сөз. Сәттілік!";
      messageEl.className = "message";
    }

    document.querySelectorAll(".key").forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("good", "bad");
    });
    keyboardEl.classList.remove("locked");

    renderWord(false);
    renderGallows();
    renderLives();
    renderStats();
  }

  /* ---------- Әріпті таңдау ---------- */
  function guess(letter) {
    if (state.over) return;
    if (state.guessed.indexOf(letter) !== -1) return;

    state.guessed.push(letter);

    var btn = keyboardEl.querySelector('[data-letter="' + letter + '"]');
    var isCorrect = state.word.indexOf(letter) !== -1;

    if (isCorrect) {
      if (btn) btn.classList.add("good");
      // ашылған әріптерді жаңарту
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        if (slot.dataset.letter === letter) {
          slot.textContent = letter;
          slot.classList.add("open");
        }
      });
    } else {
      state.mistakes += 1;
      if (btn) btn.classList.add("bad");
      renderGallows();
      if (wordEl) {
        wordEl.classList.add("shake");
        setTimeout(function () { wordEl.classList.remove("shake"); }, 420);
      }
    }

    if (btn) btn.disabled = true;
    renderLives();

    if (isCorrect && isWordSolved()) {
      finish(true);
    } else if (state.mistakes >= MAX_MISTAKES) {
      finish(false);
    } else if (isCorrect) {
      if (messageEl) {
        messageEl.textContent = "Дұрыс! Тағы бір әріп таңдаңыз.";
        messageEl.className = "message";
      }
    } else {
      var left = MAX_MISTAKES - state.mistakes;
      if (messageEl) {
        messageEl.textContent = "«" + letter + "» әрпі жоқ. Қалған мүмкіндік: " + left;
        messageEl.className = "message";
      }
    }
  }

  function isWordSolved() {
    return state.word.split("").every(function (ch) {
      return state.guessed.indexOf(ch) !== -1;
    });
  }

  /* ---------- Аяқтау ---------- */
  function finish(win) {
    state.over = true;
    keyboardEl.classList.add("locked");
    document.querySelectorAll(".key").forEach(function (btn) {
      btn.disabled = true;
    });

    if (win) {
      wordEl.className = "word win";
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        slot.textContent = slot.dataset.letter;
        slot.classList.add("open");
      });
      if (messageEl) {
        messageEl.textContent = "🎉 Жеңдіңіз! Сөз: " + state.word;
        messageEl.className = "message win";
      }
      stats.wins += 1;
      stats.streak += 1;
      confetti();
    } else {
      wordEl.className = "word lose";
      Array.prototype.forEach.call(wordEl.children, function (slot) {
        if (!slot.classList.contains("open")) slot.classList.add("reveal");
        slot.textContent = slot.dataset.letter;
      });
      if (messageEl) {
        messageEl.textContent = "Өкінішке орай, ұтылдыңыз. Дұрыс сөз: " + state.word + ". Тағы байқап көріңіз!";
        messageEl.className = "message lose";
      }
      stats.losses += 1;
      stats.streak = 0;
    }

    saveStats();
    renderStats();
  }

  /* ---------- Конфетти ---------- */
  function confetti() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var layer = document.createElement("div");
    layer.className = "confetti";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var colors = ["#22d3ee", "#8b5cf6", "#34d399", "#fbbf24", "#f472b6", "#eaf0ff"];

    for (var i = 0; i < 70; i++) {
      var piece = document.createElement("i");
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      piece.style.animationDuration = (1.7 + Math.random() * 1.6) + "s";
      piece.style.animationDelay = (Math.random() * 0.5) + "s";
      piece.style.width = (6 + Math.random() * 6) + "px";
      piece.style.height = (8 + Math.random() * 10) + "px";
      layer.appendChild(piece);
    }

    setTimeout(function () {
      layer.remove();
    }, 3600);
  }

  /* ---------- Түймелер ---------- */
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      state.index += 1;
      if (state.index >= WORDS.length) state.index = 0;
      startRound(state.index);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      startRound(state.index);
    });
  }

  if (resetStatsBtn) {
    resetStatsBtn.addEventListener("click", function () {
      stats.wins = 0;
      stats.losses = 0;
      stats.streak = 0;
      saveStats();
      renderStats();
      if (messageEl) {
        messageEl.textContent = "Есеп тазаланды. Қайтадан бастаңыз!";
        messageEl.className = "message";
      }
    });
  }

  /* ---------- Нақты клавиатура ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter" && state.over) {
      nextBtn.click();
      return;
    }
    var key = e.key.toUpperCase();
    if (key.length !== 1) return;
    if (ALPHABET.indexOf(key) === -1) return;
    e.preventDefault();
    guess(key);
  });

  /* ---------- Іске қосу ---------- */
  loadStats();
  buildKeyboard();
  startRound(0);
})();
