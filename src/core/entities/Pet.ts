import { IEntity } from '../interfaces/IEntity';

export interface Pet extends IEntity {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  imageUrl: string;
  city: string;
  state: string;
  userId: string;
  status: 'available' | 'pending' | 'adopted';
  createdAt: Date;
}

export type CreatePetDTO = Omit<Pet, 'id' | 'createdAt' | 'status'>;
export type UpdatePetDTO = Partial<CreatePetDTO>;