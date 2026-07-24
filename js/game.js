import{emptyBoard,findOpenIndex,isBoardFull,winningIndexes,colorDistance,contrastOutline}from"./utils.js";
export class ConnectGame{constructor(onChange,onFinish){this.onChange=onChange;this.onFinish=onFinish;this.reset()}
configure({mode,player1,player2,colors,startingPiece="R"}){this.mode=mode;this.player1=player1;this.player2=player2;this.colors=colors;this.startingPiece=startingPiece;this.reset()}
reset(){this.board=emptyBoard();this.currentPiece=this.startingPiece||"R";this.finished=false;this.winning=[];this.lastIndex=-1;this.onChange?.(this)}
playColumn(col){if(this.finished)return{ok:false,reason:"finished"};const i=findOpenIndex(this.board,col);if(i<0)return{ok:false,reason:"full"};this.board[i]=this.currentPiece;this.lastIndex=i;this.winning=winningIndexes(this.board,i,this.currentPiece);if(this.winning.length){this.finished=true;const p=this.currentPiece;this.onChange?.(this);this.onFinish?.({type:"win",piece:p,indexes:this.winning});return{ok:true,finished:true}}if(isBoardFull(this.board)){this.finished=true;this.onChange?.(this);this.onFinish?.({type:"draw",indexes:[]});return{ok:true,finished:true}}this.currentPiece=this.currentPiece==="R"?"Y":"R";this.onChange?.(this);return{ok:true}}}
export function renderBoard(g){const b=document.getElementById("board");if(b.children.length!==42){b.innerHTML="";for(let i=0;i<42;i++){const c=document.createElement("div");c.className="cell";b.appendChild(c)}}const similar=colorDistance(g.colors.R,g.colors.Y)<115;[...b.children].forEach((c,i)=>{c.className="cell";c.innerHTML="";const p=g.board[i];if(!p)return;const d=document.createElement("span");d.className="disc";d.style.setProperty("--disc-color",g.colors[p]);if(similar)d.classList.add(p==="R"?"contrast-light":"contrast-dark");c.appendChild(d);if(g.winning.includes(i))c.classList.add("winning")})}
export function renderMatch(g,s={R:0,Y:0}){
  document.getElementById("player1Name").textContent=g.player1;
  document.getElementById("player2Name").textContent=g.player2;
  document.getElementById("player1Score").textContent=s.R||0;
  document.getElementById("player2Score").textContent=s.Y||0;
  document.getElementById("player1Disc").style.background=g.colors.R;
  document.getElementById("player2Disc").style.background=g.colors.Y;
}
