import { ref, Ref } from 'vue';
import { Pet } from '../core/entities/Pet';
import { container } from '../di/container';
import { IPetService, PetFilters, CreatePetDTO, UpdatePetDTO } from '../core/interfaces/IPetService';

export function usePets() {
  const petService = container.resolve<IPetService>('IPetService');
  const pets: Ref<Pet[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPets = async (filters?: PetFilters) => {
    loading.value = true;
    error.value = null;

    try {
      pets.value = await petService.getPets(filters);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createPet = async (data: CreatePetDTO) => {
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

  const updatePet = async (id: string, data: UpdatePetDTO) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedPet = await petService.updatePet(id, data);
      const index = pets.value.findIndex(p => p.id === id);
      if (index !== -1) {
        pets.value[index] = updatedPet;
      }
      return updatedPet;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deletePet = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      await petService.deletePet(id);
      pets.value = pets.value.filter(p => p.id !== id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getPetById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      return await petService.getPetById(id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const adoptPet = async (petId: string, adopterId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const updatedPet = await petService.adoptPet(petId, adopterId);
      const index = pets.value.findIndex(p => p.id === petId);
      if (index !== -1) {
        pets.value[index] = updatedPet;
      }
      return updatedPet;
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
    fetchPets,
    createPet,
    updatePet,
    deletePet,
    getPetById,
    adoptPet
  };
}