import{emptyBoard,findOpenIndex,isBoardFull,winningIndexes,colorDistance,contrastOutline}from"./utils.js";
export class ConnectGame{constructor(onChange,onFinish){this.onChange=onChange;this.onFinish=onFinish;this.mode="";this.player1="Player 1";this.player2="Player 2";this.colors={R:"#ff3158",Y:"#ffd83d"};this.startingPiece="R";this.board=emptyBoard();this.currentPiece="R";this.finished=false;this.winning=[];this.lastIndex=-1}
configure({mode,player1,player2,colors,startingPiece="R"}){this.mode=mode;this.player1=player1;this.player2=player2;this.colors=colors;this.startingPiece=startingPiece;this.reset()}
reset(){this.board=emptyBoard();this.currentPiece=this.startingPiece||"R";this.finished=false;this.winning=[];this.lastIndex=-1;this.onChange?.(this)}
playColumn(col){if(this.finished)return{ok:false,reason:"finished"};const i=findOpenIndex(this.board,col);if(i<0)return{ok:false,reason:"full"};this.board[i]=this.currentPiece;this.lastIndex=i;this.winning=winningIndexes(this.board,i,this.currentPiece);if(this.winning.length){this.finished=true;const p=this.currentPiece;this.onChange?.(this);this.onFinish?.({type:"win",piece:p,indexes:this.winning});return{ok:true,finished:true}}if(isBoardFull(this.board)){this.finished=true;this.onChange?.(this);this.onFinish?.({type:"draw",indexes:[]});return{ok:true,finished:true}}this.currentPiece=this.currentPiece==="R"?"Y":"R";this.onChange?.(this);return{ok:true}}}
let previouslyRenderedBoard = Array(42).fill("");

export function renderBoard(g) {
  g.colors = g.colors || { R: "#ff3158", Y: "#ffd83d" };
  g.winning = g.winning || [];

  const boardElement = document.getElementById("board");

  if (boardElement.children.length !== 42) {
    boardElement.innerHTML = "";
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      boardElement.appendChild(cell);
    }
  }

  const addedIndexes = [];
  for (let i = 0; i < 42; i++) {
    if (!previouslyRenderedBoard[i] && g.board[i]) {
      addedIndexes.push(i);
    }
  }

  // Animate only when exactly one new disc was added.
  // This prevents all pieces from animating after sync, refresh, or rerender.
  const animatedIndex = addedIndexes.length === 1 ? addedIndexes[0] : -1;
  const similarColors = colorDistance(g.colors.R, g.colors.Y) < 115;

  [...boardElement.children].forEach((cell, index) => {
    cell.className = "cell";
    cell.innerHTML = "";

    const piece = g.board[index];
    if (!piece) return;

    const disc = document.createElement("span");
    disc.className = "disc";
    disc.style.setProperty("--disc-color", g.colors[piece]);

    if (index === animatedIndex) {
      disc.classList.add("disc-drop");
    }

    if (similarColors) {
      disc.classList.add(piece === "R" ? "contrast-light" : "contrast-dark");
    }

    cell.appendChild(disc);

    if (g.winning.includes(index)) {
      cell.classList.add("winning");
    }
  });

  previouslyRenderedBoard = [...g.board];
}

export function renderMatch(g,s={R:0,Y:0}){
  document.getElementById("player1Name").textContent=g.player1;
  document.getElementById("player2Name").textContent=g.player2;
  document.getElementById("player1Score").textContent=s.R||0;
  document.getElementById("player2Score").textContent=s.Y||0;
  document.getElementById("player1Disc").style.background=g.colors.R;
  document.getElementById("player2Disc").style.background=g.colors.Y;
}
