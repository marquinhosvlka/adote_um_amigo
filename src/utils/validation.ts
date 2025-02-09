import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/),
  password: z.string().min(6),
});

export const petSchema = z.object({
  name: z.string().min(2).max(30),
  species: z.enum(['Cachorro', 'Gato', 'Outros']),
  breed: z.string().min(2).max(30),
  age: z.number().min(0).max(30),
  size: z.enum(['Pequeno', 'Médio', 'Grande']),
  description: z.string().min(10).max(500),
  city: z.string(),
  state: z.string(),
  imageUrl: z.string().url(),
});

export type UserValidation = z.infer<typeof userSchema>;
export type PetValidation = z.infer<typeof petSchema>;