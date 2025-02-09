import imageCompression from 'browser-image-compression';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class ImageService {
  private static async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  }

  static async uploadImage(file: File, path: string): Promise<string> {
    const compressedFile = await this.compressImage(file);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(storageRef);
  }

  static async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = `${basePath}/${Date.now()}_${index}`;
      return this.uploadImage(file, path);
    });

    return await Promise.all(uploadPromises);
  }
}