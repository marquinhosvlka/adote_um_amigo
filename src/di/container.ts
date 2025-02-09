import { Container } from './Container';
import { FirebaseAuthService } from '../infrastructure/services/FirebaseAuthService';
import { FirebaseStorageService } from '../infrastructure/services/FirebaseStorageService';
import { FirebasePetService } from '../infrastructure/services/FirebasePetService';

// Inicialização do container
const container = Container.getInstance();

// Registro dos serviços
container.register('IAuthService', new FirebaseAuthService());
container.register('IStorageService', new FirebaseStorageService());
container.register('IPetService', new FirebasePetService());

export { container };