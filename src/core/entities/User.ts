import { IEntity } from '../interfaces/IEntity';

export interface User extends IEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserDTO = Partial<CreateUserDTO>;