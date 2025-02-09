import { IEntity } from '../interfaces/IEntity';

export interface Partner extends IEntity {
  id: string;
  name: string;
  type: 'veterinary' | 'petshop' | 'shelter';
  description: string;
  contacts: {
    phone: string;
    email: string;
    website?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  services: string[];
  rating: number;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  imageUrl: string;
  createdAt: Date;
}

export type CreatePartnerDTO = Omit<Partner, 'id' | 'rating' | 'reviews' | 'createdAt'>;