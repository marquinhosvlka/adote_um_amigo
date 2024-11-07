export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  avatar?: string;
  createdAt: Date;
}

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  description: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  ownerId: string;
  status: 'available' | 'pending' | 'adopted';
  createdAt: Date;
}

export interface AdoptionRequest {
  id: string;
  petId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}