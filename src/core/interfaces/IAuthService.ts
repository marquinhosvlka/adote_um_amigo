export interface IAuthService {
  login(email: string, password: string): Promise<void>;
  register(data: RegisterDTO): Promise<void>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): User | null;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}