import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';
import { IService } from './IService';

export interface IUserService extends IService<User> {
  createUser(data: CreateUserDTO): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
}