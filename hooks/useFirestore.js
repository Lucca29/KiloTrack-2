import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export function useFirestore() {
  const app = getApp();
  const db = getFirestore(app);
  return db;
} 