import { User, CreateUserDTO, UpdateUserDTO } from '../core/entities/User';
import { IUserService } from '../core/interfaces/IUserService';
import { IRepository } from '../core/interfaces/IRepository';

export class UserService implements IUserService {
  constructor(private repository: IRepository<User>) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    return this.repository.create({
      ...data,
      createdAt: new Date()
    });
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    return this.repository.update(id, data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.repository.findAll({ email });
    return users.length > 0 ? users[0] : null;
  }

  // IService implementation
  async create(data: any): Promise<User> {
    return this.createUser(data);
  }

  async update(id: string, data: any): Promise<User> {
    return this.updateUser(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }
}