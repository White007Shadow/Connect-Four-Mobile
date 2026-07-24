const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = "R";
let player1 = "Player 1";
let player2 = "Player 2";
let score1 = 0;
let score2 = 0;
let gameOver = false;

const boardElement = document.getElementById("board");
const columnButtonsElement = document.getElementById("columnButtons");
const turnText = document.getElementById("turnText");
const player1Score = document.getElementById("player1Score");
const player2Score = document.getElementById("player2Score");
const nameDialog = document.getElementById("nameDialog");
const tutorialDialog = document.getElementById("tutorialDialog");

function createBoard() {
  boardElement.innerHTML = "";
  columnButtonsElement.innerHTML = "";
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));

  for (let col = 0; col < COLS; col++) {
    const button = document.createElement("button");
    button.textContent = col + 1;
    button.addEventListener("click", () => makeMove(col));
    columnButtonsElement.appendChild(button);
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${row}-${col}`;
      boardElement.appendChild(cell);
    }
  }
}

function makeMove(col) {
  if (gameOver) {
    alert("Round finished. Tap New Round.");
    return;
  }

  let selectedRow = -1;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === "") {
      selectedRow = row;
      break;
    }
  }

  if (selectedRow === -1) {
    alert("This column is full.");
    return;
  }

  board[selectedRow][col] = currentPlayer;
  const cell = document.getElementById(`cell-${selectedRow}-${col}`);
  cell.classList.add(currentPlayer === "R" ? "red" : "yellow");

  if (checkWinner(selectedRow, col)) {
    gameOver = true;
    const winner = getCurrentPlayerName();
    if (currentPlayer === "R") score1++;
    else score2++;
    updateText();
    setTimeout(() => alert(winner + " wins!"), 100);
    return;
  }

  if (isBoardFull()) {
    gameOver = true;
    setTimeout(() => alert("Game draw!"), 100);
    return;
  }

  currentPlayer = currentPlayer === "R" ? "Y" : "R";
  updateText();
}

function checkWinner(row, col) {
  const piece = board[row][col];
  return countConnected(row, col, 0, 1, piece) >= 4 ||
         countConnected(row, col, 1, 0, piece) >= 4 ||
         countConnected(row, col, 1, 1, piece) >= 4 ||
         countConnected(row, col, 1, -1, piece) >= 4;
}

function countConnected(row, col, rowMove, colMove, piece) {
  return 1 +
    countOneSide(row, col, rowMove, colMove, piece) +
    countOneSide(row, col, -rowMove, -colMove, piece);
}

function countOneSide(row, col, rowMove, colMove, piece) {
  let total = 0;
  let nextRow = row + rowMove;
  let nextCol = col + colMove;
  while (
    nextRow >= 0 && nextRow < ROWS &&
    nextCol >= 0 && nextCol < COLS &&
    board[nextRow][nextCol] === piece
  ) {
    total++;
    nextRow += rowMove;
    nextCol += colMove;
  }
  return total;
}

function isBoardFull() {
  return board[0].every(cell => cell !== "");
}

function getCurrentPlayerName() {
  return currentPlayer === "R" ? player1 : player2;
}

function updateText() {
  player1Score.textContent = `${player1}: ${score1}`;
  player2Score.textContent = `${player2}: ${score2}`;
  turnText.textContent = `${getCurrentPlayerName()}'s turn`;
}

function newRound() {
  currentPlayer = "R";
  gameOver = false;
  createBoard();
  updateText();
}

document.getElementById("newRoundBtn").addEventListener("click", newRound);
document.getElementById("resetScoreBtn").addEventListener("click", () => {
  score1 = 0;
  score2 = 0;
  updateText();
});
document.getElementById("tutorialBtn").addEventListener("click", () => tutorialDialog.showModal());
document.getElementById("closeTutorialBtn").addEventListener("click", () => tutorialDialog.close());
document.getElementById("startBtn").addEventListener("click", () => {
  const name1 = document.getElementById("player1Input").value.trim();
  const name2 = document.getElementById("player2Input").value.trim();
  if (name1 !== "") player1 = name1;
  if (name2 !== "") player2 = name2;
  nameDialog.close();
  newRound();
});

createBoard();
updateText();
nameDialog.showModal();
