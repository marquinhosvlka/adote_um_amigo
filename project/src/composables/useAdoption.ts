import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificationsStore } from '../stores/notifications';
import { container } from '../di/Container';
import { IPetService } from '../core/interfaces/IPetService';

export interface AdoptionRequestData {
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  reason: string;
}

export function useAdoption() {
  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const requestAdoption = async (petId: string, data: AdoptionRequestData) => {
    if (!authStore.user) {
      throw new Error('User must be authenticated');
    }

    loading.value = true;
    error.value = null;

    try {
      const petService = container.resolve<IPetService>('IPetService');
      await petService.adoptPet(petId, authStore.user.uid);
      
      // Notify pet owner
      await notificationsStore.addNotification(data.adopterEmail, {
        type: 'adoption_request',
        message: `Novo pedido de adoção de ${data.adopterName}`,
        petId
      });

      return true;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    requestAdoption,
    loading,
    error
  };
}