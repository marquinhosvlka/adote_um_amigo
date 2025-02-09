import { IEntity } from '../interfaces/IEntity';

export interface Pet extends IEntity {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  images: string[];
  city: string;
  state: string;
  userId: string;
  status: 'available' | 'pending' | 'adopted';
  adoptedBy?: string;
  adoptedAt?: Date;
  createdAt: Date;
  imageUrl: string;
}

export type CreatePetDTO = Omit<Pet, 'id' | 'createdAt' | 'status' | 'adoptedBy' | 'adoptedAt' | 'images'>;
export type UpdatePetDTO = Partial<CreatePetDTO>;