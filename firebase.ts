// firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// ✅ Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyAmB_wDxvKkrbD3G8e3qqldfvUIaqke-gs",
    authDomain: "peertutorfinder.firebaseapp.com",
    projectId: "peertutorfinder",
    storageBucket: "peertutorfinder.firebasestorage.app",
    messagingSenderId: "861946198169",
    appId: "1:861946198169:web:55369d32dda12c14f62008"
};  

// ✅ Ensure we initialize only once in Next.js (optional, good practice)
let app: FirebaseApp;
if (!initializeApp.length) {
  app = initializeApp(firebaseConfig);
} else {
  app = initializeApp(firebaseConfig);
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
