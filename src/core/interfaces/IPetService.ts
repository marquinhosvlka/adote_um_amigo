import { Pet, CreatePetDTO, UpdatePetDTO } from '../entities/Pet';

export interface IPetService extends IService<Pet> {
  createPet(data: CreatePetDTO): Promise<Pet>;
  updatePet(id: string, data: UpdatePetDTO): Promise<Pet>;
  adoptPet(petId: string, adopterId: string): Promise<Pet>;
  getAvailablePets(filters?: Partial<Pet>): Promise<Pet[]>;
}