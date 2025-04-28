import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuració de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKsOnvpuIlQx0yysxTnaI9ywo0lbcvCAk",
  authDomain: "carmatch-c263c.firebaseapp.com",
  projectId: "carmatch-c263c",
  storageBucket: "carmatch-c263c.appspot.com",
  messagingSenderId: "531716217010",
  appId: "1:531716217010:web:136d5de8726c4d7d2291ab"
};

// Comprova si l'app ja està inicialitzada
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
