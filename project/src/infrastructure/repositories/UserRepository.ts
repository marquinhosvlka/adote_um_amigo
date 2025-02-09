import { User } from '../../core/entities/User';
import { FirebaseRepository } from './FirebaseRepository';

export class UserRepository extends FirebaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll({ email });
    return users.length > 0 ? users[0] : null;
  }
}