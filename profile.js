export const emptyBoard=()=>Array(42).fill("");
export function findOpenIndex(board,col){for(let r=5;r>=0;r--){const i=r*7+col;if(!board[i])return i}return-1}
export const validColumns=b=>Array.from({length:7},(_,i)=>i).filter(c=>!b[c]);
export const isBoardFull=b=>b.every(Boolean);
export function winningIndexes(board,last,piece){if(last<0)return[];const row=Math.floor(last/7),col=last%7;for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]]){const cells=[[row,col]];collect(board,cells,row,col,dr,dc,piece);collect(board,cells,row,col,-dr,-dc,piece);if(cells.length>=4)return cells.map(([r,c])=>r*7+c)}return[]}
function collect(b,cells,row,col,dr,dc,p){let r=row+dr,c=col+dc;while(r>=0&&r<6&&c>=0&&c<7&&b[r*7+c]===p){cells.push([r,c]);r+=dr;c+=dc}}
export const randomCode=()=>String(Math.floor(100000+Math.random()*900000));
export const sanitizeName=v=>String(v||"").trim().replace(/[<>]/g,"").slice(0,18)||"Player";
export function colorDistance(a,b){const f=x=>[0,2,4].map(i=>parseInt(x.replace("#","").slice(i,i+2),16));const[r1,g1,b1]=f(a),[r2,g2,b2]=f(b);return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2)}
export function contrastOutline(c){const h=c.replace("#",""),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return .299*r+.587*g+.114*b>150?"contrast-dark":"contrast-light"}
export function formatTime(t){if(!t)return"";const d=t.toDate?t.toDate():new Date(t);return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
export function showToast(m){const e=document.getElementById("toast");e.textContent=m;e.classList.remove("hidden");clearTimeout(showToast.t);showToast.t=setTimeout(()=>e.classList.add("hidden"),2200)}
