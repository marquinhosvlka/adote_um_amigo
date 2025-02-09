import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserService extends IService<User> {
  createUser(data: CreateUserDTO): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
}