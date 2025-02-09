import { IEntity } from '../interfaces/IEntity';

export interface Message extends IEntity {
  id: string;
  senderId: string;
  receiverId: string;
  petId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export type CreateMessageDTO = Omit<Message, 'id' | 'createdAt' | 'read'>;