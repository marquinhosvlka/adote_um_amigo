export interface IStorageService {
  uploadFile(file: File, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getDownloadUrl(path: string): Promise<string>;
}