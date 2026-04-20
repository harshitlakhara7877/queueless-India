import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCKwqytGIBL-bbq36LJAAFeQD1i7lF-dTs",
  authDomain: "queueless-india-aa772.firebaseapp.com",
  projectId: "queueless-india-aa772",
  storageBucket: "queueless-india-aa772.firebasestorage.app",
  messagingSenderId: "182670115159",
  appId: "1:182670115159:web:2b7125bcf12ce4a62f7e12",
  measurementId: "G-LKGVWRKEVM"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);


