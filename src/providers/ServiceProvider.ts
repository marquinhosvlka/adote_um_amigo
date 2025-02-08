import { PetRepository } from '../infrastructure/repositories/PetRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { PetService } from '../services/PetService';
import { UserService } from '../services/UserService';
import { IPetService } from '../core/interfaces/IPetService';
import { IUserService } from '../core/interfaces/IUserService';

export class ServiceProvider {
  private static instance: ServiceProvider;
  private services: Map<string, any>;

  private constructor() {
    this.services = new Map();
    this.registerServices();
  }

  static getInstance(): ServiceProvider {
    if (!ServiceProvider.instance) {
      ServiceProvider.instance = new ServiceProvider();
    }
    return ServiceProvider.instance;
  }

  private registerServices() {
    const petRepository = new PetRepository();
    const userRepository = new UserRepository();

    this.services.set('petService', new PetService(petRepository));
    this.services.set('userService', new UserService(userRepository));
  }

  getPetService(): IPetService {
    return this.services.get('petService');
  }

  getUserService(): IUserService {
    return this.services.get('userService');
  }
}