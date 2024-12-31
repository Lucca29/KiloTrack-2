import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Remplacez ces valeurs par celles de votre projet Firebase
  apiKey: "AIzaSyD7GTlLs44FHTAZ29YNRONMs46_-FKShdw",
  authDomain: "drivetrack-ba7a4.firebaseapp.com",
  databaseURL: "https://drivetrack-ba7a4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "drivetrack-ba7a4",
  storageBucket: "drivetrack-ba7a4.firebasestorage.app",
  messagingSenderId: "1014865470427",
  appId: "1:1014865470427:web:eea854b59542f79104fdfe",
  measurementId: "G-CS5KYCV0SF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 