import { ref, Ref } from 'vue';
import { Pet } from '../core/entities/Pet';
import { PetService } from '../services/PetService';

export function usePets() {
  const pets: Ref<Pet[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const petService = new PetService();

  const fetchAvailablePets = async (filters?: Partial<Pet>) => {
    loading.value = true;
    error.value = null;

    try {
      pets.value = await petService.getAvailablePets(filters);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createPet = async (data: any) => {
    loading.value = true;
    error.value = null;

    try {
      const pet = await petService.createPet(data);
      pets.value.push(pet);
      return pet;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    pets,
    loading,
    error,
    fetchAvailablePets,
    createPet
  };
}