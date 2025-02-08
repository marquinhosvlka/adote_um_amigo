export interface IService<T> {
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<T | null>;
}