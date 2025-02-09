import { IStorageService } from '../../core/interfaces/IStorageService';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

export class FirebaseStorageService implements IStorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await this.getDownloadUrl(path);
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  async getDownloadUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
}