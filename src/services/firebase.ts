import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Batch, LiveClass } from '../types';

export const firebaseService = {
  // Batches
  async addBatch(batch: Omit<Batch, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'batches'), {
        ...batch,
        createdAt: new Date(),
        isActive: true,
        enrolledStudents: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding batch:', error);
      throw error;
    }
  },

  async getBatches() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'batches'), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Batch[];
    } catch (error) {
      console.error('Error getting batches:', error);
      throw error;
    }
  },

  async updateBatch(id: string, updates: Partial<Batch>) {
    try {
      await updateDoc(doc(db, 'batches', id), updates);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  async deleteBatch(id: string) {
    try {
      await deleteDoc(doc(db, 'batches', id));
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  },

  // Real-time listeners
  onBatchesChange(
    onNext: (batches: Batch[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const batches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Batch[];
        onNext(batches);
      },
      (error) => {
        console.error("Firestore (onBatchesChange): ", error);
        if (onError) onError(error);
      }
    );
  },

  // Live Classes
  async addLiveClass(liveClass: Omit<LiveClass, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'liveClasses'), {
        ...liveClass,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding live class:', error);
      throw error;
    }
  },

  async getLiveClasses() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'liveClasses'), orderBy('scheduledTime', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiveClass[];
    } catch (error) {
      console.error('Error getting live classes:', error);
      throw error;
    }
  },

  async updateLiveClass(id: string, updates: Partial<LiveClass>) {
    try {
      await updateDoc(doc(db, 'liveClasses', id), updates);
    } catch (error) {
      console.error('Error updating live class:', error);
      throw error;
    }
  },

  async deleteLiveClass(id: string) {
    try {
      await deleteDoc(doc(db, 'liveClasses', id));
    } catch (error) {
      console.error('Error deleting live class:', error);
      throw error;
    }
  },

  onLiveClassesChange(
    onNext: (liveClasses: LiveClass[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    const q = query(collection(db, 'liveClasses'), orderBy('scheduledTime', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const liveClasses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LiveClass[];
        onNext(liveClasses);
      },
      (error) => {
        console.error("Firestore (onLiveClassesChange): ", error);
        if (onError) onError(error);
      }
    );
  },
};
