import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AdoptionRequest } from '../types';

export const useAdoptionsStore = defineStore('adoptions', () => {
  const adoptionRequests = ref<AdoptionRequest[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createAdoptionRequest = async (
    data: Omit<AdoptionRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const docRef = await addDoc(collection(db, 'adoptionRequests'), {
        ...data,
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
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const requestRef = doc(db, 'adoptionRequests', id);
      await updateDoc(requestRef, { status });

      if (status === 'approved') {
        const request = adoptionRequests.value.find((r) => r.id === id);
        if (request) {
          // Update pet status
          const petRef = doc(db, 'pets', request.petId);
          await updateDoc(petRef, { status: 'adopted' });
        }
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchUserRequests = async (userId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'adoptionRequests'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      adoptionRequests.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdoptionRequest[];

      return adoptionRequests.value;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchPetRequests = async (petId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'adoptionRequests'),
        where('petId', '==', petId)
      );

      const snapshot = await getDocs(q);
      adoptionRequests.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdoptionRequest[];

      return adoptionRequests.value;
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
    createAdoptionRequest,
    updateAdoptionStatus,
    fetchUserRequests,
    fetchPetRequests,
  };
});
