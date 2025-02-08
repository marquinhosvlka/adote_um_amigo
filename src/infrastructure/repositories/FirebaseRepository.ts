import { IEntity } from '../../core/interfaces/IEntity';
import { IRepository } from '../../core/interfaces/IRepository';
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
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';

export class FirebaseRepository<T extends IEntity> implements IRepository<T> {
  constructor(private collectionName: string) {}

  private convertToEntity(doc: DocumentData): T {
    return {
      id: doc.id,
      ...doc.data()
    } as T;
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...entity,
      createdAt: new Date()
    });
    
    const newDoc = await getDoc(docRef);
    return this.convertToEntity(newDoc);
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, { ...entity });
    
    const updatedDoc = await getDoc(docRef);
    return this.convertToEntity(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async findById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return this.convertToEntity(docSnap);
  }

  async findAll(filters?: Partial<T>): Promise<T[]> {
    let queryConstraints: QueryConstraint[] = [];
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryConstraints.push(where(key, '==', value));
        }
      });
    }
    
    const q = query(collection(db, this.collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => this.convertToEntity(doc));
  }
}