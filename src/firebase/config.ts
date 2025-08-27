import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB1HaDqkILJvreVeFljcn4mypaJfdHuxMY",
  authDomain: "nexttoppers-ab24d.firebaseapp.com",
  projectId: "nexttoppers-ab24d",
  storageBucket: "nexttoppers-ab24d.firebasestorage.app",
  messagingSenderId: "846870084201",
  appId: "1:846870084201:web:39f99c5c462a06004540f8",
  measurementId: "G-KFRTCREFZ6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
