import{sanitizeName}from"./utils.js";const PK="connect4_profile_v3",SK="connect4_stats_v3";
export function loadProfile(){const d={id:crypto.randomUUID?crypto.randomUUID().slice(0,8):Math.random().toString(36).slice(2,10),name:"Player",color:"#ff3158"};const p={...d,...(JSON.parse(localStorage.getItem(PK)||"null")||{})};return saveProfile(p)}
export function saveProfile(p){const c={id:p.id,name:sanitizeName(p.name),color:p.color||"#ff3158"};localStorage.setItem(PK,JSON.stringify(c));return c}
export function loadStats(){return{wins:0,losses:0,draws:0,games:0,streak:0,best:0,...(JSON.parse(localStorage.getItem(SK)||"null")||{})}}
export function recordResult(r){const s=loadStats();s.games++;if(r==="win"){s.wins++;s.streak++;s.best=Math.max(s.best,s.streak)}else if(r==="loss"){s.losses++;s.streak=0}else s.draws++;localStorage.setItem(SK,JSON.stringify(s));return s}
export function resetStats(){localStorage.removeItem(SK);return loadStats()}
export function renderProfile(p){profileDisplayName.textContent=p.name;profileIdText.textContent=`Player ID: ${p.id}`;profileAvatar.textContent=p.name[0].toUpperCase()}
export function renderStats(s){winsStat.textContent=s.wins;lossesStat.textContent=s.losses;drawsStat.textContent=s.draws;gamesStat.textContent=s.games;streakStat.textContent=s.streak;bestStat.textContent=s.best;winRateStat.textContent=s.games?`${Math.round(s.wins/s.games*100)}%`:"0%"}
