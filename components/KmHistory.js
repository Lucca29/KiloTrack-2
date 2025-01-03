import { collection, query, orderBy, getDocs, Firestore } from 'firebase/firestore';
import { firestore, firebaseApp } from '../firebaseConfig';

const fetchKmHistory = async () => {
  try {
    console.log('Checking Firestore instance...');
    
    if (!(firestore instanceof Firestore)) {
      console.error('Invalid Firestore instance:', firestore);
      throw new Error('Invalid Firestore instance');
    }

    console.log('Creating collection reference...');
    const kmRef = collection(firestore, 'kilometers');
    
    console.log('Creating query...');
    const q = query(kmRef, orderBy('date', 'desc'));
    
    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    
    console.log('Query completed successfully');
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur détaillée:", error);
    console.error("Type d'erreur:", error.constructor.name);
    console.error("Message d'erreur:", error.message);
    throw error;
  }
}; 