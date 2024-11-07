import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyADG6oTEaW13VdmRM7dwCsRMGapbUtE4FM",
  authDomain: "adote-um-amigo-47e00.firebaseapp.com",
  projectId: "adote-um-amigo-47e00",
  storageBucket: "adote-um-amigo-47e00.firebasestorage.app",
  messagingSenderId: "358242152195",
  appId: "1:358242152195:web:2b0f4c4593fca1ead50336",
  measurementId: "G-CXPY71ZQET"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);