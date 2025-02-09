import { Pet, CreatePetDTO, UpdatePetDTO } from '../core/entities/Pet';
import { IPetService, PetFilters } from '../core/interfaces/IPetService';
import { IRepository } from '../core/interfaces/IRepository';

export class PetService implements IPetService {
  constructor(private repository: IRepository<Pet>) {}

  async createPet(data: CreatePetDTO): Promise<Pet> {
    return this.repository.create({
      ...data,
      status: 'available',
      createdAt: new Date()
    });
  }

  async updatePet(id: string, data: UpdatePetDTO): Promise<Pet> {
    return this.repository.update(id, data);
  }

  async deletePet(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getPets(filters?: PetFilters): Promise<Pet[]> {
    return this.repository.findAll(filters as Partial<Pet>);
  }

  async getPetById(id: string): Promise<Pet | null> {
    return this.repository.findById(id);
  }

  async adoptPet(petId: string, adopterId: string): Promise<Pet> {
    return this.repository.update(petId, {
      status: 'adopted',
      adoptedBy: adopterId,
      adoptedAt: new Date()
    });
  }

  // IService implementation
  async create(data: any): Promise<Pet> {
    return this.createPet(data);
  }

  async update(id: string, data: any): Promise<Pet> {
    return this.updatePet(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.deletePet(id);
  }

  async getById(id: string): Promise<Pet | null> {
    return this.getPetById(id);
  }
}