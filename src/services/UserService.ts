import { User, CreateUserDTO, UpdateUserDTO } from '../core/entities/User';
import { UserRepository } from '../infrastructure/repositories/UserRepository';

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.repository.create(data);
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return this.repository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getUser(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }
}