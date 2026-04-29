import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeNbASClk3hymzPu9_ZvBnS_OrRivBDIg",
  authDomain: "dashboard-apps-modules.firebaseapp.com",
  projectId: "dashboard-apps-modules",
  storageBucket: "dashboard-apps-modules.firebasestorage.app",
  messagingSenderId: "1036555898015",
  appId: "1:1036555898015:web:5a1c0e7d7f86602481a6aa",
  measurementId: "G-PK12XW83QB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
