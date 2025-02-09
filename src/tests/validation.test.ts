import { describe, it, expect } from 'vitest';
import { userSchema, petSchema } from '../utils/validation';

describe('User Validation', () => {
  it('should validate correct user data', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(11) 98765-4321',
      password: '123456',
    };

    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid user data', () => {
    const invalidUser = {
      name: 'J',
      email: 'invalid-email',
      phone: '123',
      password: '123',
    };

    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });
});

describe('Pet Validation', () => {
  it('should validate correct pet data', () => {
    const validPet = {
      name: 'Rex',
      species: 'Cachorro',
      breed: 'Labrador',
      age: 5,
      size: 'Médio',
      description: 'Um cachorro muito amigável e brincalhão',
      city: 'São Paulo',
      state: 'SP',
      imageUrl: 'https://example.com/image.jpg',
    };

    const result = petSchema.safeParse(validPet);
    expect(result.success).toBe(true);
  });

  it('should reject invalid pet data', () => {
    const invalidPet = {
      name: 'R',
      species: 'Invalid',
      breed: 'L',
      age: -1,
      size: 'Invalid',
      description: 'Short',
      city: '',
      state: '',
      imageUrl: 'invalid-url',
    };

    const result = petSchema.safeParse(invalidPet);
    expect(result.success).toBe(false);
  });
});