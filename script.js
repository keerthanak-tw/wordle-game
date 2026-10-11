const WORDS = [
  "APPLE", "BRAVE", "CRANE", "DREAM", "EARTH", "FLAME", "GRAPE",
  "HOUSE", "KNIFE", "LEMON", "MANGO", "NORTH", "OCEAN", "PLANT",
  "QUEEN", "RIVER", "STONE", "TRAIN", "VOICE", "WATER", "YOUNG",
  "ZEBRA", "BLOOM", "CHARM", "DEPTH", "EAGLE", "FROST", "GHOST",
  "HONEY", "IVORY", "JELLY", "KNOCK", "LIGHT", "MUSIC", "OASIS",
  "PEACH", "RHYME", "SHEEP", "TIGER", "UNITY", "VIVID", "WHEEL",
  "XENON", "YACHT", "ZONAL"
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

let secretWord = "";
let currentGuess = "";
let guessCount = 0;
let gameOver = false;

const board = document.getElementById("board");
const guessInput = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const newGameButton = document.getElementById("new-game-button");
const guessCountElement = document.getElementById("guess-count");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalText = document.getElementById("modal-text");
const modalButton = document.getElementById("modal-button");

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
];

function pickRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function createBoard() {
  board.innerHTML = "";
  for (let row = 0; row < MAX_GUESSES; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "row";
    for (let col = 0; col < WORD_LENGTH; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      rowElement.appendChild(tile);
    }
    board.appendChild(rowElement);
  }
}

function createKeyboard() {
  keyboard.innerHTML = "";
  keyboardRows.forEach((rowLetters) => {
    const row = document.createElement("div");
    row.className = "keyboard-row";
    rowLetters.forEach((letter) => {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "key";
      key.textContent = letter;
      key.dataset.key = letter;
      key.addEventListener("click", () => {
        if (!gameOver) {
          handleKeyInput(letter);
        }
      });
      row.appendChild(key);
    });
    keyboard.appendChild(row);
  });
}

function updateGuessCount() {
  guessCountElement.textContent = String(MAX_GUESSES - guessCount);
}

function setMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
}

function showModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
}

function resetKeyboard() {
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.remove("correct", "wrong-spot", "absent");
  });
}

function updateKeyboardStatus(guessFeedback) {
  guessFeedback.forEach(({ letter, status }) => {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (!key) return;

    if (status === "correct") {
      key.classList.add("correct");
    } else if (status === "wrong-spot") {
      key.classList.add("wrong-spot");
    } else if (status === "absent") {
      key.classList.add("absent");
    }
  });
}

function renderCurrentGuess() {
  const rows = board.querySelectorAll(".row");
  const activeRow = rows[guessCount];

  if (!activeRow) return;

  const tiles = activeRow.querySelectorAll(".tile");
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = tiles[i];
    if (currentGuess[i]) {
      tile.textContent = currentGuess[i];
      tile.classList.add("filled");
    } else {
      tile.textContent = "";
      tile.classList.remove("filled");
    }
  }
}

function evaluateGuess(guess) {
  const result = [];
  const secretLetters = secretWord.split("");
  const remaining = {};

  const statuses = new Array(WORD_LENGTH).fill("absent");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === secretLetters[i]) {
      statuses[i] = "correct";
    } else {
      remaining[secretLetters[i]] = (remaining[secretLetters[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (statuses[i] === "correct") continue;

    const letter = guess[i];
    if (remaining[letter] > 0) {
      statuses[i] = "wrong-spot";
      remaining[letter]--;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = board.querySelectorAll(".row")[guessCount].querySelectorAll(".tile")[i];
    tile.classList.add(statuses[i]);
    result.push({
      letter: guess[i],
      status: statuses[i]
    });
  }

  updateKeyboardStatus(result);
  return result;
}

function handleKeyInput(key) {
  if (gameOver) return;

  if (key === "ENTER") {
    submitGuess();
    return;
  }

  if (key === "BACK") {
    currentGuess = currentGuess.slice(0, -1);
    renderCurrentGuess();
    return;
  }

  if (currentGuess.length >= WORD_LENGTH) return;

  currentGuess += key;
  renderCurrentGuess();
}

function submitGuess() {
  if (gameOver) return;

  if (currentGuess.length !== WORD_LENGTH) {
    setMessage("Word must be 5 letters.");
    return;
  }

  const normalized = currentGuess.toUpperCase();

  if (!WORDS.includes(normalized)) {
    setMessage("Not in the word list.");
    return;
  }

  guessCount += 1;
  updateGuessCount();

  const feedback = evaluateGuess(normalized);

  setMessage("");

  if (normalized === secretWord) {
    gameOver = true;
    setMessage(`You won! The word was ${secretWord}.`, true);
    showModal("You Win!", `You guessed the word in ${guessCount} tries.`);
    return;
  }

  if (guessCount >= MAX_GUESSES) {
    gameOver = true;
    setMessage(`Out of guesses! The word was ${secretWord}.`);
    showModal("Game Over", `The word was ${secretWord}.`);
    return;
  }

  currentGuess = "";
  renderCurrentGuess();
}

function startNewGame() {
  secretWord = pickRandomWord();
  currentGuess = "";
  guessCount = 0;
  gameOver = false;

  createBoard();
  updateGuessCount();
  setMessage("");
  hideModal();
  guessInput.value = "";
  guessInput.focus();

  resetKeyboard();
}

guessButton.addEventListener("click", submitGuess);
newGameButton.addEventListener("click", startNewGame);
modalButton.addEventListener("click", startNewGame);

guessInput.addEventListener("input", (e) => {
  const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
  currentGuess = raw;
  e.target.value = raw;
  renderCurrentGuess();
});

guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitGuess();
  } else if (e.key === "Backspace") {
    currentGuess = currentGuess.slice(0, -1);
    renderCurrentGuess();
  }
});

createBoard();
createKeyboard();
startNewGame();
