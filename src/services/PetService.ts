import { Pet, CreatePetDTO, UpdatePetDTO } from '../core/entities/Pet';
import { PetRepository } from '../infrastructure/repositories/PetRepository';

export class PetService {
  private repository: PetRepository;

  constructor() {
    this.repository = new PetRepository();
  }

  async createPet(data: CreatePetDTO): Promise<Pet> {
    return this.repository.create(data);
  }

  async updatePet(id: string, data: UpdatePetDTO): Promise<Pet> {
    return this.repository.update(id, data);
  }

  async deletePet(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getPet(id: string): Promise<Pet | null> {
    return this.repository.findById(id);
  }

  async getAvailablePets(filters?: Partial<Pet>): Promise<Pet[]> {
    return this.repository.findAvailable(filters);
  }

  async adoptPet(petId: string, adopterId: string): Promise<Pet> {
    return this.repository.markAsAdopted(petId, adopterId);
  }
}