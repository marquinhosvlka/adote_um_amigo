import { Pet } from '../entities/Pet';
import { IService } from './IService';

export interface PetFilters {
  species?: 'dog' | 'cat' | 'other';
  size?: 'small' | 'medium' | 'large';
  city?: string;
  state?: string;
}

export interface IPetService extends IService<Pet> {
  createPet(data: CreatePetDTO): Promise<Pet>;
  updatePet(id: string, data: UpdatePetDTO): Promise<Pet>;
  deletePet(id: string): Promise<void>;
  getPets(filters?: PetFilters): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet | null>;
  adoptPet(petId: string, adopterId: string): Promise<Pet>;
}

export interface CreatePetDTO {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  city: string;
  state: string;
  userId: string;
  imageUrl: string;
}

export interface UpdatePetDTO extends Partial<CreatePetDTO> {}