import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZabLqhd02SIXk41FeDm3EtmAmNEhSbTk",
  authDomain: "connect4-73d21.firebaseapp.com",
  projectId: "connect4-73d21",
  storageBucket: "connect4-73d21.firebasestorage.app",
  messagingSenderId: "959863469334",
  appId: "1:959863469334:web:87eab2667b0104bed84c37",
  measurementId: "G-MK1MZCTJJH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ROWS = 6;
const COLS = 7;

let board = emptyBoard();
let mode = "";
let currentPlayer = "R";
let gameOver = false;

let player1 = "Player 1";
let player2 = "Player 2";
let score1 = 0;
let score2 = 0;

let myUid = "";
let myPiece = "";
let roomCode = "";
let stopRoomListener = null;
let roomData = null;

const homeScreen = document.getElementById("homeScreen");
const onlineScreen = document.getElementById("onlineScreen");
const gameScreen = document.getElementById("gameScreen");

const boardElement = document.getElementById("board");
const columnButtons = document.getElementById("columnButtons");
const scoreText = document.getElementById("scoreText");
const turnText = document.getElementById("turnText");
const roomText = document.getElementById("roomText");
const streakText = document.getElementById("streakText");
const gameMessage = document.getElementById("gameMessage");
const modeLabel = document.getElementById("modeLabel");

const onlineMessage = document.getElementById("onlineMessage");
const roomCodeInput = document.getElementById("roomCodeInput");
const shareBtn = document.getElementById("shareBtn");
const copyBtn = document.getElementById("copyBtn");
const rematchBtn = document.getElementById("rematchBtn");

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}

// Firestore does not allow arrays inside arrays.
// Store the 6x7 board as one flat array of 42 cells.
function boardToFirestore(testBoard) {
  return testBoard.flat();
}

function boardFromFirestore(savedBoard) {
  if (!Array.isArray(savedBoard) || savedBoard.length !== ROWS * COLS) {
    return emptyBoard();
  }

  const restoredBoard = [];

  for (let row = 0; row < ROWS; row++) {
    const start = row * COLS;
    restoredBoard.push(savedBoard.slice(start, start + COLS));
  }

  return restoredBoard;
}

function showScreen(screen) {
  homeScreen.classList.remove("active");
  onlineScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  screen.classList.add("active");
}

function getName() {
  const name = document.getElementById("playerName").value.trim();
  return name || "Player";
}

function buildBoard() {
  boardElement.innerHTML = "";
  columnButtons.innerHTML = "";

  for (let col = 0; col < COLS; col++) {
    const button = document.createElement("button");
    button.textContent = col + 1;
    button.addEventListener("click", () => handleColumn(col));
    columnButtons.appendChild(button);
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${row}-${col}`;
      boardElement.appendChild(cell);
    }
  }

  drawBoard();
}

function drawBoard(winningCells = []) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.getElementById(`cell-${row}-${col}`);
      if (!cell) continue;

      cell.className = "cell";

      if (board[row][col] === "R") cell.classList.add("red");
      if (board[row][col] === "Y") cell.classList.add("yellow");

      if (winningCells.some(pos => pos[0] === row && pos[1] === col)) {
        cell.classList.add("winning");
      }
    }
  }
}

function updateLabels() {
  scoreText.textContent = `${player1}: ${score1}  -  ${player2}: ${score2}`;

  if (gameOver) return;

  const name = currentPlayer === "R" ? player1 : player2;
  turnText.textContent = `${name}'s turn`;

  if (mode === "single") {
    const stats = loadStats();
    streakText.textContent = `Current streak: ${stats.streak} | Best: ${stats.best}`;
  } else {
    streakText.textContent = "";
  }
}

function startSinglePlayer() {
  mode = "single";
  player1 = getName();
  player2 = "Computer";
  score1 = 0;
  score2 = 0;
  modeLabel.textContent = "Single Player";
  roomText.textContent = "";
  rematchBtn.classList.add("hidden");
  resetRound();
  showScreen(gameScreen);
}

function startLocalPlayer() {
  mode = "local";
  player1 = getName();

  const second = prompt("Enter Player 2 name:");
  player2 = second && second.trim() ? second.trim() : "Player 2";

  score1 = 0;
  score2 = 0;
  modeLabel.textContent = "Local Multiplayer";
  roomText.textContent = "";
  rematchBtn.classList.add("hidden");
  resetRound();
  showScreen(gameScreen);
}

function resetRound() {
  board = emptyBoard();
  currentPlayer = "R";
  gameOver = false;
  gameMessage.textContent = "";
  turnText.textContent = "";
  buildBoard();
  updateLabels();
}

function handleColumn(col) {
  if (mode === "online") {
    makeOnlineMove(col);
    return;
  }

  if (gameOver) {
    gameMessage.textContent = "Start a new round first.";
    return;
  }

  makeLocalMove(col);

  if (mode === "single" && !gameOver && currentPlayer === "Y") {
    gameMessage.textContent = "Computer is thinking...";

    setTimeout(() => {
      const aiColumn = chooseAiMove();
      makeLocalMove(aiColumn);
      gameMessage.textContent = "";
    }, 450);
  }
}

function makeLocalMove(col) {
  const row = findOpenRow(board, col);

  if (row === -1) {
    gameMessage.textContent = "That column is full.";
    return;
  }

  board[row][col] = currentPlayer;

  const winningCells = getWinningCells(board, row, col, currentPlayer);
  drawBoard(winningCells);

  if (winningCells.length >= 4) {
    endLocalGame(currentPlayer, winningCells);
    return;
  }

  if (isBoardFull(board)) {
    gameOver = true;
    turnText.textContent = "Draw game";
    gameMessage.textContent = "The board is full.";
    updateSingleStats("draw");
    return;
  }

  currentPlayer = currentPlayer === "R" ? "Y" : "R";
  updateLabels();
}

function endLocalGame(winnerPiece, winningCells) {
  gameOver = true;
  drawBoard(winningCells);

  const winner = winnerPiece === "R" ? player1 : player2;

  if (winnerPiece === "R") score1++;
  else score2++;

  turnText.textContent = `${winner} wins!`;
  gameMessage.textContent = "Press New Round to play again.";

  if (mode === "single") {
    updateSingleStats(winnerPiece === "R" ? "win" : "loss");
  }

  updateLabels();
}

function chooseAiMove() {
  const valid = getValidColumns(board);

  for (const col of valid) {
    const test = copyBoard(board);
    const row = findOpenRow(test, col);
    test[row][col] = "Y";
    if (getWinningCells(test, row, col, "Y").length >= 4) return col;
  }

  for (const col of valid) {
    const test = copyBoard(board);
    const row = findOpenRow(test, col);
    test[row][col] = "R";
    if (getWinningCells(test, row, col, "R").length >= 4) return col;
  }

  if (valid.includes(3)) return 3;

  return valid[Math.floor(Math.random() * valid.length)];
}

function findOpenRow(testBoard, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (testBoard[row][col] === "") return row;
  }
  return -1;
}

function getValidColumns(testBoard) {
  const columns = [];
  for (let col = 0; col < COLS; col++) {
    if (testBoard[0][col] === "") columns.push(col);
  }
  return columns;
}

function copyBoard(testBoard) {
  return testBoard.map(row => [...row]);
}

function isBoardFull(testBoard) {
  return testBoard[0].every(cell => cell !== "");
}

function getWinningCells(testBoard, row, col, piece) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [rowMove, colMove] of directions) {
    const cells = [[row, col]];

    addDirection(testBoard, cells, row, col, rowMove, colMove, piece);
    addDirection(testBoard, cells, row, col, -rowMove, -colMove, piece);

    if (cells.length >= 4) return cells;
  }

  return [];
}

function addDirection(testBoard, cells, row, col, rowMove, colMove, piece) {
  let nextRow = row + rowMove;
  let nextCol = col + colMove;

  while (
    nextRow >= 0 &&
    nextRow < ROWS &&
    nextCol >= 0 &&
    nextCol < COLS &&
    testBoard[nextRow][nextCol] === piece
  ) {
    cells.push([nextRow, nextCol]);
    nextRow += rowMove;
    nextCol += colMove;
  }
}

function loadStats() {
  return JSON.parse(localStorage.getItem("connect4Stats")) || {
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    best: 0
  };
}

function updateSingleStats(result) {
  const stats = loadStats();

  if (result === "win") {
    stats.wins++;
    stats.streak++;
    if (stats.streak > stats.best) stats.best = stats.streak;
  } else if (result === "loss") {
    stats.losses++;
    stats.streak = 0;
  } else {
    stats.draws++;
  }

  localStorage.setItem("connect4Stats", JSON.stringify(stats));
  showStats();
}

function showStats() {
  const stats = loadStats();

  document.getElementById("statWins").textContent = stats.wins;
  document.getElementById("statLosses").textContent = stats.losses;
  document.getElementById("statStreak").textContent = stats.streak;
  document.getElementById("statBest").textContent = stats.best;
}

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createRoom() {
  if (!myUid) {
    onlineMessage.textContent = "Still connecting to Firebase. Try again.";
    return;
  }

  roomCode = generateRoomCode();
  myPiece = "R";
  player1 = getName();
  player2 = "Waiting...";

  const roomRef = doc(db, "rooms", roomCode);

  await setDoc(roomRef, {
    board: boardToFirestore(emptyBoard()),
    currentPlayer: "R",
    status: "waiting",
    gameOver: false,
    winner: "",
    player1: {
      uid: myUid,
      name: player1,
      score: 0
    },
    player2: null,
    rematch1: false,
    rematch2: false,
    createdAt: serverTimestamp()
  });

  onlineMessage.textContent = `Room ${roomCode} created. Waiting for Player 2...`;
  shareBtn.classList.remove("hidden");
  copyBtn.classList.remove("hidden");

  listenToRoom();
}

async function joinRoom() {
  if (!myUid) {
    onlineMessage.textContent = "Still connecting to Firebase. Try again.";
    return;
  }

  const code = roomCodeInput.value.trim();

  if (code.length !== 6) {
    onlineMessage.textContent = "Enter a 6-digit room code.";
    return;
  }

  const roomRef = doc(db, "rooms", code);
  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    onlineMessage.textContent = "Room not found.";
    return;
  }

  const data = snapshot.data();

  if (data.player2 && data.player2.uid !== myUid) {
    onlineMessage.textContent = "This room is full.";
    return;
  }

  roomCode = code;
  myPiece = "Y";
  player1 = data.player1.name;
  player2 = getName();

  await updateDoc(roomRef, {
    player2: {
      uid: myUid,
      name: player2,
      score: data.player2?.score || 0
    },
    status: "playing"
  });

  listenToRoom();
}

function listenToRoom() {
  if (stopRoomListener) stopRoomListener();

  const roomRef = doc(db, "rooms", roomCode);

  stopRoomListener = onSnapshot(roomRef, snapshot => {
    if (!snapshot.exists()) {
      onlineMessage.textContent = "Room no longer exists.";
      return;
    }

    roomData = snapshot.data();
    mode = "online";
    board = boardFromFirestore(roomData.board);
    currentPlayer = roomData.currentPlayer || "R";
    gameOver = Boolean(roomData.gameOver);

    player1 = roomData.player1?.name || "Player 1";
    player2 = roomData.player2?.name || "Waiting...";
    score1 = roomData.player1?.score || 0;
    score2 = roomData.player2?.score || 0;

    modeLabel.textContent = "Online Multiplayer";
    roomText.textContent = `Room code: ${roomCode}`;
    rematchBtn.classList.remove("hidden");

    buildBoard();
    updateLabels();

    if (roomData.status === "waiting") {
      turnText.textContent = "Waiting for Player 2...";
    } else if (roomData.gameOver) {
      turnText.textContent = roomData.winner
        ? `${roomData.winner} wins!`
        : "Draw game";

      gameMessage.textContent = "Press Rematch to play again.";
    } else {
      const name = currentPlayer === "R" ? player1 : player2;
      turnText.textContent = currentPlayer === myPiece
        ? `Your turn (${name})`
        : `${name}'s turn`;
      gameMessage.textContent = "";
    }

    showScreen(gameScreen);
  });
}

async function makeOnlineMove(col) {
  if (!roomData || roomData.status !== "playing") {
    gameMessage.textContent = "Waiting for another player.";
    return;
  }

  if (roomData.gameOver) {
    gameMessage.textContent = "The round is finished.";
    return;
  }

  if (roomData.currentPlayer !== myPiece) {
    gameMessage.textContent = "It is not your turn.";
    return;
  }

  const updatedBoard = copyBoard(boardFromFirestore(roomData.board));
  const row = findOpenRow(updatedBoard, col);

  if (row === -1) {
    gameMessage.textContent = "That column is full.";
    return;
  }

  updatedBoard[row][col] = myPiece;

  const winningCells = getWinningCells(updatedBoard, row, col, myPiece);
  const roomRef = doc(db, "rooms", roomCode);

  if (winningCells.length >= 4) {
    const winnerName = myPiece === "R" ? player1 : player2;

    const changes = {
      board: boardToFirestore(updatedBoard),
      gameOver: true,
      winner: winnerName
    };

    if (myPiece === "R") {
      changes["player1.score"] = score1 + 1;
    } else {
      changes["player2.score"] = score2 + 1;
    }

    await updateDoc(roomRef, changes);
    return;
  }

  if (isBoardFull(updatedBoard)) {
    await updateDoc(roomRef, {
      board: boardToFirestore(updatedBoard),
      gameOver: true,
      winner: ""
    });
    return;
  }

  await updateDoc(roomRef, {
    board: boardToFirestore(updatedBoard),
    currentPlayer: myPiece === "R" ? "Y" : "R"
  });
}

async function requestRematch() {
  if (!roomCode || !roomData) return;

  const roomRef = doc(db, "rooms", roomCode);
  const field = myPiece === "R" ? "rematch1" : "rematch2";

  await updateDoc(roomRef, {
    [field]: true
  });

  const fresh = await getDoc(roomRef);
  const data = fresh.data();

  if (data.rematch1 && data.rematch2) {
    await updateDoc(roomRef, {
      board: boardToFirestore(emptyBoard()),
      currentPlayer: "R",
      gameOver: false,
      winner: "",
      rematch1: false,
      rematch2: false
    });
  } else {
    gameMessage.textContent = "Rematch requested. Waiting for opponent...";
  }
}

function getInviteLink() {
  return `${location.origin}${location.pathname}?room=${roomCode}`;
}

function shareRoom() {
  const message = `Play Connect Four with me! Room code: ${roomCode} ${getInviteLink()}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
}

async function copyRoomLink() {
  await navigator.clipboard.writeText(getInviteLink());
  onlineMessage.textContent = "Invite link copied.";
}

function leaveGame() {
  if (stopRoomListener) {
    stopRoomListener();
    stopRoomListener = null;
  }

  mode = "";
  roomCode = "";
  myPiece = "";
  roomData = null;
  showStats();
  showScreen(homeScreen);
}

document.getElementById("singleBtn").addEventListener("click", startSinglePlayer);
document.getElementById("localBtn").addEventListener("click", startLocalPlayer);
document.getElementById("onlineBtn").addEventListener("click", () => showScreen(onlineScreen));
document.getElementById("onlineBackBtn").addEventListener("click", () => showScreen(homeScreen));

document.getElementById("createRoomBtn").addEventListener("click", createRoom);
document.getElementById("joinRoomBtn").addEventListener("click", joinRoom);
shareBtn.addEventListener("click", shareRoom);
copyBtn.addEventListener("click", copyRoomLink);

document.getElementById("newRoundBtn").addEventListener("click", () => {
  if (mode === "online") {
    gameMessage.textContent = "Use Rematch for online games.";
  } else {
    resetRound();
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (mode === "online") {
    gameMessage.textContent = "Online scores cannot be reset during a room.";
    return;
  }

  score1 = 0;
  score2 = 0;
  resetRound();
});

rematchBtn.addEventListener("click", requestRematch);
document.getElementById("homeBtn").addEventListener("click", leaveGame);

const tutorialDialog = document.getElementById("tutorialDialog");

document.getElementById("tutorialBtn").addEventListener("click", () => tutorialDialog.showModal());
document.getElementById("tutorialGameBtn").addEventListener("click", () => tutorialDialog.showModal());
document.getElementById("closeTutorialBtn").addEventListener("click", () => tutorialDialog.close());

onAuthStateChanged(auth, user => {
  if (user) {
    myUid = user.uid;
  }
});

signInAnonymously(auth).catch(error => {
  console.error(error);
  onlineMessage.textContent = "Firebase login failed. Enable Anonymous Authentication.";
});

const params = new URLSearchParams(location.search);
const sharedRoom = params.get("room");

if (sharedRoom) {
  roomCodeInput.value = sharedRoom;
  showScreen(onlineScreen);
}

showStats();
buildBoard();
