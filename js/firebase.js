import{initializeApp}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import{getAuth,onAuthStateChanged,signInAnonymously,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,linkWithPopup,linkWithCredential,EmailAuthProvider}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import{getFirestore,doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,runTransaction,serverTimestamp,collection,addDoc,query,orderBy,limit,increment}from"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import{firebaseConfig}from"./config.js";const app=initializeApp(firebaseConfig);export const auth=getAuth(app);export const db=getFirestore(app);
export async function ensureAuth(){if(auth.currentUser)return auth.currentUser;await signInAnonymously(auth);return new Promise(r=>{const stop=onAuthStateChanged(auth,u=>{if(u){stop();r(u)}})})}
export async function loginGoogle(){const p=new GoogleAuthProvider(),u=await ensureAuth();try{return await linkWithPopup(u,p)}catch(e){if(e.code==="auth/credential-already-in-use")return signInWithPopup(auth,p);throw e}}
export async function registerEmail(email,password){const u=await ensureAuth(),c=EmailAuthProvider.credential(email,password);try{return await linkWithCredential(u,c)}catch(e){if(e.code==="auth/email-already-in-use")return signInWithEmailAndPassword(auth,email,password);throw e}}
export const loginEmail=(e,p)=>signInWithEmailAndPassword(auth,e,p);
export{doc,getDoc,setDoc,updateDoc,deleteDoc,onSnapshot,runTransaction,serverTimestamp,collection,addDoc,query,orderBy,limit,increment};
