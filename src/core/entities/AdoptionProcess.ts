import { IEntity } from '../interfaces/IEntity';

export interface AdoptionProcess extends IEntity {
  id: string;
  petId: string;
  adopterId: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  questionnaire: {
    hasOtherPets: boolean;
    hasYard: boolean;
    workingHours: string;
    familySize: number;
    previousExperience: string;
    otherInfo: string;
  };
  termsAccepted: boolean;
  followUpReports: {
    date: Date;
    content: string;
    images: string[];
  }[];
  createdAt: Date;
}

export type CreateAdoptionProcessDTO = Omit<AdoptionProcess, 'id' | 'status' | 'followUpReports' | 'createdAt'>;