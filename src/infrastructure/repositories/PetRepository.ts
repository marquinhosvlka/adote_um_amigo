import { Pet, CreatePetDTO, UpdatePetDTO } from '../../core/entities/Pet';
import { FirebaseRepository } from './FirebaseRepository';

export class PetRepository extends FirebaseRepository<Pet> {
  constructor() {
    super('pets');
  }

  async findAvailable(filters?: Partial<Pet>): Promise<Pet[]> {
    return this.findAll({ ...filters, status: 'available' });
  }

  async markAsAdopted(petId: string, adopterId: string): Promise<Pet> {
    return this.update(petId, {
      status: 'adopted',
      adoptedBy: adopterId,
      adoptedAt: new Date()
    });
  }
}