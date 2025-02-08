import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

export const useAdoptionsStore = defineStore('adoptions', () => {
  const adoptionRequests = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasUserRequestedPet = async (userId: string, petId: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, `pets/${petId}/adoptionRequests`),
        where('adopterId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (e) {
      console.error('Error checking adoption request:', e);
      return false;
    }
  };

  const createAdoptionRequest = async (
    petId: string,
    userId: string,
    data: {
      adopterName: string;
      adopterEmail: string;
      adopterPhone: string;
      reason: string;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // Check if user has already requested this pet
      const hasRequested = await hasUserRequestedPet(userId, petId);
      if (hasRequested) {
        throw new Error('Você já solicitou a adoção deste pet');
      }

      // Check if pet is still available
      const petDoc = await getDoc(doc(db, 'pets', petId));
      if (!petDoc.exists() || petDoc.data()?.status !== 'available') {
        throw new Error('Este pet não está mais disponível para adoção');
      }

      const docRef = await addDoc(collection(db, `pets/${petId}/adoptionRequests`), {
        ...data,
        adopterId: userId,
        status: 'pending',
        createdAt: new Date(),
      });

      return docRef.id;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateAdoptionStatus = async (
    petId: string,
    requestId: string,
    adopterId: string,
    status: 'approved' | 'rejected'
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const batch = writeBatch(db);

      // Update adoption request status
      const requestRef = doc(db, `pets/${petId}/adoptionRequests/${requestId}`);
      batch.update(requestRef, { status });

      if (status === 'approved') {
        // Update pet status and add adoptedBy field
        const petRef = doc(db, 'pets', petId);
        batch.update(petRef, {
          status: 'adopted',
          adoptedBy: adopterId,
          adoptedAt: new Date()
        });

        // Get all pending requests for this pet
        const pendingRequests = await getDocs(
          query(
            collection(db, `pets/${petId}/adoptionRequests`),
            where('status', '==', 'pending')
          )
        );

        // Reject all other pending requests
        pendingRequests.docs.forEach(doc => {
          if (doc.id !== requestId) {
            const reqRef = doc.ref;
            batch.update(reqRef, { status: 'rejected' });
          }
        });
      }

      await batch.commit();
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserAdoptionRequests = async (userId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const requests: any[] = [];
      const petsRef = collection(db, 'pets');
      const petsSnapshot = await getDocs(petsRef);

      for (const petDoc of petsSnapshot.docs) {
        const requestsRef = collection(db, `pets/${petDoc.id}/adoptionRequests`);
        const q = query(requestsRef, where('adopterId', '==', userId));
        const requestsSnapshot = await getDocs(q);

        requestsSnapshot.docs.forEach(requestDoc => {
          requests.push({
            id: requestDoc.id,
            petId: petDoc.id,
            petData: petDoc.data(),
            ...requestDoc.data()
          });
        });
      }

      adoptionRequests.value = requests;
      return requests;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    adoptionRequests,
    loading,
    error,
    hasUserRequestedPet,
    createAdoptionRequest,
    updateAdoptionStatus,
    fetchUserAdoptionRequests,
  };
});