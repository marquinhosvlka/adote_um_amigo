<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { useAdoptionsStore } from '../stores/adoptions';
import { useNotificationsStore } from '../stores/notifications';
import { isValidEmail, isValidPhone, isValidName, formatPhone } from '../utils/validators';
import { X, Maximize2 } from 'lucide-vue-next';

const formatAge = (age: number, ageUnit: 'days' | 'weeks' | 'months' | 'years') => {
  const units: Record<string, string> = {
    days: 'dias',
    weeks: 'semanas',
    months: 'meses',
    years: 'anos'
  };
  return `${age} ${units[ageUnit]}`;
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const adoptionsStore = useAdoptionsStore();
const notificationsStore = useNotificationsStore();

const pet = ref<any>(null);
const owner = ref<any>(null);
const loading = ref(true);
const showAdoptionForm = ref(false);
const adoptionRequests = ref<any[]>([]);
const adoptionReason = ref('');
const adopterName = ref('');
const adopterEmail = ref('');
const adopterPhone = ref('');
const error = ref('');
const notificationMessage = ref('');
const showNotification = ref(false);
const showImageModal = ref(false);

const validateAdoptionForm = () => {
  error.value = '';
  
  if (!isValidName(adopterName.value)) {
    error.value = 'Nome inválido';
    return false;
  }
  
  if (!isValidEmail(adopterEmail.value)) {
    error.value = 'Email inválido';
    return false;
  }
  
  if (!isValidPhone(adopterPhone.value)) {
    error.value = 'Telefone inválido';
    return false;
  }
  
  if (adoptionReason.value.length < 10) {
    error.value = 'Por favor, forneça um motivo mais detalhado';
    return false;
  }
  
  return true;
};

const fetchAdoptionRequests = async () => {
  if (!pet.value || !authStore.user || authStore.user.uid !== pet.value.userId) return;

  try {
    const requestsRef = collection(db, `pets/${pet.value.id}/adoptionRequests`);
    const requestsSnapshot = await getDocs(requestsRef);
    
    const requests = await Promise.all(
      requestsSnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let adopterInfo = null;
        
        if (data.adopterId) {
          try {
            const adopterDocRef = doc(db, 'users', data.adopterId);
            const adopterDocSnapshot = await getDoc(adopterDocRef);
            if (adopterDocSnapshot.exists()) {
              adopterInfo = adopterDocSnapshot.data();
            }
          } catch (error) {
            console.error('Erro ao buscar informações do adotante:', error);
            adopterInfo = {
              name: data.adopterName,
              email: data.adopterEmail,
              phone: data.adopterPhone
            };
          }
        }

        return {
          id: docSnapshot.id,
          ...data,
          adopterInfo: adopterInfo || {
            name: data.adopterName,
            email: data.adopterEmail,
            phone: data.adopterPhone
          }
        };
      })
    );

    adoptionRequests.value = requests;
  } catch (error) {
    console.error('Erro ao buscar pedidos de adoção:', error);
  }
};

const fetchPetDetails = async () => {
  if (!route.params.id) {
    router.push('/');
    return;
  }

  try {
    const petDoc = await getDoc(doc(db, 'pets', route.params.id as string));
    
    if (!petDoc.exists()) {
      router.push('/');
      return;
    }

    pet.value = { id: petDoc.id, ...petDoc.data() };

    // Buscar informações do dono
    if (pet.value.userId) {
      const ownerDoc = await getDoc(doc(db, 'users', pet.value.userId));
      if (ownerDoc.exists()) {
        owner.value = ownerDoc.data();
      }
    }

    // Buscar pedidos de adoção se o usuário for o dono do pet
    await fetchAdoptionRequests();
  } catch (error) {
    console.error('Erro ao buscar detalhes do pet:', error);
    router.push('/');
  } finally {
    loading.value = false;
  }
};

const handleAdoptionRequest = async () => {
  if (!authStore.user) {
    router.push('/login');
    return;
  }

  if (!validateAdoptionForm()) return;

  try {
    // Check if user has already requested this pet
    const hasRequested = await adoptionsStore.hasUserRequestedPet(
      authStore.user.uid,
      pet.value.id
    );

    if (hasRequested) {
      error.value = 'Você já solicitou a adoção deste pet';
      return;
    }

    await adoptionsStore.createAdoptionRequest(
      pet.value.id,
      authStore.user.uid,
      {
        adopterName: adopterName.value,
        adopterEmail: adopterEmail.value,
        adopterPhone: adopterPhone.value,
        reason: adoptionReason.value,
      }
    );

    // Add notification for the pet owner
    await notificationsStore.addNotification(pet.value.userId, {
      type: 'adoption_request',
      message: `Novo pedido de adoção para ${pet.value.name} de ${adopterName.value}`,
      petId: pet.value.id,
    });

    notificationMessage.value = 'Pedido de adoção enviado com sucesso!';
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 8000);
    
    // Reset form and close it
    showAdoptionForm.value = false;
    adopterName.value = '';
    adopterEmail.value = '';
    adopterPhone.value = '';
    adoptionReason.value = '';
    
    // Refresh pet details to update UI
    await fetchPetDetails();
  } catch (e: any) {
    error.value = e.message || 'Erro ao enviar solicitação. Tente novamente.';
  }
};

const handleAdoptionResponse = async (requestId: string, adopterId: string, status: 'approved' | 'rejected') => {
  try {
    await adoptionsStore.updateAdoptionStatus(
      pet.value.id,
      requestId,
      adopterId,
      status
    );

    // Add notification for the adopter
    const message = status === 'approved' 
      ? `Seu pedido de adoção para ${pet.value.name} foi aprovado!`
      : `Seu pedido de adoção para ${pet.value.name} foi recusado.`;
      
    await notificationsStore.addNotification(adopterId, {
      type: status === 'approved' ? 'adoption_approved' : 'adoption_rejected',
      message,
      petId: pet.value.id,
    });

    notificationMessage.value = status === 'approved' 
      ? 'Pedido de adoção aprovado com sucesso!'
      : 'Pedido de adoção recusado.';
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);

    // Refresh pet details and adoption requests
    await fetchPetDetails();
    
    // If approved, update the pet status immediately in the UI
    if (status === 'approved') {
      pet.value.status = 'adopted';
    }
  } catch (e: any) {
    error.value = e.message || 'Erro ao processar o pedido. Tente novamente.';
  }
};

onMounted(fetchPetDetails);
</script>

<style scoped>
.image-section {
  width: 100%;
}

.image-container {
  width: 100%;
  height: 500px;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.image-container:hover .pet-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.image-container:hover .image-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 1;
}

.view-full-button {
  background-color: white;
  color: #1f2937;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.view-full-button:hover {
  transform: scale(1.05);
}

.card {
  @apply bg-white p-6 rounded-lg shadow-md;
}

.btn-primary {
  @apply bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors;
}
</style>