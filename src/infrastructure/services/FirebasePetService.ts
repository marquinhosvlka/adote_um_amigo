import { IPetService, CreatePetDTO, UpdatePetDTO, PetFilters } from '../../core/interfaces/IPetService';
import { Pet } from '../../core/entities/Pet';
import { db } from '../../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  QueryConstraint
} from 'firebase/firestore';

export class FirebasePetService implements IPetService {
  private readonly collectionName = 'pets';

  async createPet(data: CreatePetDTO): Promise<Pet> {
    const petData = {
      ...data,
      status: 'available',
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, this.collectionName), petData);
    const newDoc = await getDoc(docRef);
    
    return {
      id: newDoc.id,
      ...newDoc.data()
    } as Pet;
  }

  async updatePet(id: string, data: UpdatePetDTO): Promise<Pet> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { ...data });
    
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Pet;
  }

  async deletePet(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getPets(filters?: PetFilters): Promise<Pet[]> {
    const constraints: QueryConstraint[] = [];
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          constraints.push(where(key, '==', value));
        }
      });
    }
    
    const q = query(collection(db, this.collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Pet));
  }

  async getPetById(id: string): Promise<Pet | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Pet;
  }

  async adoptPet(petId: string, adopterId: string): Promise<Pet> {
    return this.updatePet(petId, {
      status: 'adopted',
      adoptedBy: adopterId,
      adoptedAt: new Date()
    });
  }
}