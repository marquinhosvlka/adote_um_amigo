export interface Container {
  register(key: string, service: any): void;
  resolve<T>(key: string): T;
}