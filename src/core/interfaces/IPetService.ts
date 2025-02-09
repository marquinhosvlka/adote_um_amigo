import { Pet } from '../entities/Pet';

export interface PetFilters {
  species?: string;
  size?: string;
  city?: string;
  status?: 'available' | 'pending' | 'adopted';
}

export interface CreatePetDTO {
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  description: string;
  imageUrl: string;
  city: string;
  state: string;
  userId: string;
}

export interface UpdatePetDTO extends Partial<CreatePetDTO> {
  status?: 'available' | 'pending' | 'adopted';
  adoptedBy?: string;
  adoptedAt?: Date;
}

export interface IPetService {
  createPet(data: CreatePetDTO): Promise<Pet>;
  updatePet(id: string, data: UpdatePetDTO): Promise<Pet>;
  deletePet(id: string): Promise<void>;
  getPets(filters?: PetFilters): Promise<Pet[]>;
  getPetById(id: string): Promise<Pet | null>;
  adoptPet(petId: string, adopterId: string): Promise<Pet>;
}