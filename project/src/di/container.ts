import { Container } from './Container.types';
import { FirebaseAuthService } from '../infrastructure/services/FirebaseAuthService';
import { FirebaseStorageService } from '../infrastructure/services/FirebaseStorageService';
import { FirebasePetService } from '../infrastructure/services/FirebasePetService';

// Container class implementation
class ContainerImpl {
  private static instance: ContainerImpl;
  private services: Map<string, any>;

  private constructor() {
    this.services = new Map();
  }

  static getInstance(): ContainerImpl {
    if (!ContainerImpl.instance) {
      ContainerImpl.instance = new ContainerImpl();
    }
    return ContainerImpl.instance;
  }

  register(key: string, service: any): void {
    this.services.set(key, service);
  }

  resolve<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }
    return service as T;
  }
}

// Initialize container
const container = ContainerImpl.getInstance();

// Register services
container.register('IAuthService', new FirebaseAuthService());
container.register('IStorageService', new FirebaseStorageService());
container.register('IPetService', new FirebasePetService());

export { container };