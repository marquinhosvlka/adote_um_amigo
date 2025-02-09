import { db } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import type { Message } from '../core/entities/Message';

export class ChatService {
  static async sendMessage(message: Omit<Message, 'id' | 'createdAt' | 'read'>): Promise<void> {
    await addDoc(collection(db, 'messages'), {
      ...message,
      read: false,
      createdAt: new Date(),
    });
  }

  static subscribeToMessages(userId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      callback(messages);
    });
  }
}