<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebase/config';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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
const hasRequestedAdoption = ref(false);
const currentUserRequest = ref<any>(null);
const petExists = ref(true);

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

const checkUserAdoptionRequest = async () => {
  if (!authStore.user || !pet.value) return;

  try {
    const requestsRef = collection(db, `pets/${pet.value.id}/adoptionRequests`);
    const requestsSnapshot = await getDocs(requestsRef);
    
    const userRequest = requestsSnapshot.docs.find(doc => 
      doc.data().adopterId === authStore.user?.uid
    );

    if (userRequest) {
      hasRequestedAdoption.value = true;
      currentUserRequest.value = {
        id: userRequest.id,
        ...userRequest.data()
      };
    }
  } catch (error) {
    console.error('Erro ao verificar pedido de adoção:', error);
  }
};

const cancelAdoptionRequest = async () => {
  if (!currentUserRequest.value || !pet.value) return;

  try {
    // Delete the adoption request
    await deleteDoc(doc(db, `pets/${pet.value.id}/adoptionRequests/${currentUserRequest.value.id}`));
    
    notificationMessage.value = 'Pedido de adoção cancelado com sucesso!';
    showNotification.value = true;
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);

    // Update local state
    hasRequestedAdoption.value = false;
    currentUserRequest.value = null;

    // Refresh adoption requests
    await fetchAdoptionRequests();
  } catch (error) {
    console.error('Erro ao cancelar pedido de adoção:', error);
  }
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
      petExists.value = false;
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

    // Check if user has requested adoption
    await checkUserAdoptionRequest();

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

    notificationMessage.value = 'Pedido de adoção enviado com sucesso!<br> Aguarde o anunciante entrar em contato <br>por um dos contatos fornecidos!';
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
    
    // Update local state
    hasRequestedAdoption.value = true;
    await checkUserAdoptionRequest();
    
    // Refresh adoption requests
    await fetchAdoptionRequests();
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
      ? 'Pedido de adoção aprovado com sucesso!<br> Entre em contato com alguns dos contatos fornecidos!'
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

<template>
  <div v-if="loading" class="flex justify-center items-center min-h-[60vh]">
    <p class="text-gray-600">Carregando...</p>
  </div>

  <div v-else-if="!petExists" class="max-w-6xl mx-auto">
    <div class="card bg-yellow-50 text-center py-8">
      <h2 class="text-2xl font-bold text-yellow-800 mb-4">Pet não encontrado</h2>
      <p class="text-yellow-700 mb-6">Este pet foi excluído ou não está mais disponível.</p>
      <router-link to="/" class="btn-primary">Voltar para a página inicial</router-link>
    </div>
  </div>

  <div v-else-if="pet" class="max-w-6xl mx-auto">
    <!-- Pet Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Image Section -->
      <div class="image-section">
        <div
          class="image-container"
          @click="showImageModal = true"
        >
          <img
            :src="pet.imageUrl"
            :alt="pet.name"
            class="pet-image"
            @error="($event.target as HTMLImageElement).src = '/src/assets/logo.png'"
          />
          <div class="image-overlay">
            <button class="view-full-button">
              <Maximize2 class="h-5 w-5 mr-2" />
              Ver imagem completa
            </button>
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-primary mb-2">{{ pet.name }}</h1>
          <p class="text-gray-600">
            {{ pet.breed }} • {{ formatAge(pet.age, pet.ageUnit) }}
          </p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-4">Sobre {{ pet.name }}</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ pet.description }}</p>
        </div>

        <!-- Status Badge -->
        <div v-if="pet.status !== 'available'" class="card bg-yellow-50">
          <p class="text-yellow-800 font-medium">
            Este pet não está mais disponível para adoção
          </p>
        </div>

        <!-- Adoption Actions -->
        <div v-else-if="authStore.user && authStore.user.uid !== pet.userId">
          <!-- Show Cancel Button if user has already requested -->
          <div v-if="hasRequestedAdoption" class="space-y-4">
            <div class="card bg-blue-50">
              <p class="text-blue-800 font-medium mb-4">
                Você já solicitou a adoção deste pet
              </p>
              <button
                @click="cancelAdoptionRequest"
                class="btn-secondary w-full"
              >
                Cancelar pedido de adoção
              </button>
            </div>
          </div>

          <!-- Show Adoption Form Button if user hasn't requested -->
          <div v-else>
            <button
              v-if="!showAdoptionForm"
              @click="showAdoptionForm = true"
              class="btn-primary w-full"
            >
              Quero Adotar
            </button>

            <form
              v-else
              @submit.prevent="handleAdoptionRequest"
              class="card space-y-4"
            >
              <h2 class="text-xl font-semibold mb-4">Formulário de Adoção</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  v-model="adopterName"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  v-model="adopterEmail"
                  type="email"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  v-model="adopterPhone"
                  type="tel"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Por que você quer adotar {{ pet.name }}?
                </label>
                <textarea
                  v-model="adoptionReason"
                  rows="4"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                ></textarea>
              </div>

              <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  @click="showAdoptionForm = false"
                  class="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Login CTA -->
        <div v-else-if="!authStore.user" class="card bg-yellow-50">
          <p class="text-yellow-800 mb-4">
            Faça login para solicitar a adoção deste pet
          </p>
          <router-link to="/login" class="btn-primary block text-center">
            Fazer Login
          </router-link>
        </div>

        <!-- Owner Section -->
        <div v-if="owner" class="card">
          <h2 class="text-xl font-semibold mb-4">Responsável</h2>
          <p class="text-gray-700">{{ owner.name }}</p>
          <p class="text-gray-600">{{ formatPhone(owner.phone) }}</p>
        </div>
      </div>
    </div>

    <!-- Adoption Requests Section (Only visible to pet owner) -->
    <div
      v-if="authStore.user && authStore.user.uid === pet.userId && adoptionRequests.length > 0"
      class="mt-12"
    >
      <h2 class="text-2xl font-bold mb-6">Pedidos de Adoção</h2>
      <div class="space-y-4">
        <div
          v-for="request in adoptionRequests"
          :key="request.id"
          class="card"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">
                {{ request.adopterInfo.name }}
              </h3>
              <p class="text-gray-600">{{ request.adopterInfo.email }}</p>
              <p class="text-gray-600">
                {{ formatPhone(request.adopterInfo.phone) }}
              </p>
              <p class="mt-4">{{ request.reason }}</p>
            </div>
            <div
              v-if="request.status === 'pending'"
              class="flex space-x-2"
            >
              <button
                @click="handleAdoptionResponse(request.id, request.adopterId, 'approved')"
                class="btn-primary"
              >
                Aprovar
              </button>
              <button
                @click="handleAdoptionResponse(request.id, request.adopterId, 'rejected')"
                class="btn-secondary"
              >
                Recusar
              </button>
            </div>
            <div v-else>
              <span
                :class="{
                  'text-green-600': request.status === 'approved',
                  'text-red-600': request.status === 'rejected'
                }"
              >
                {{ request.status === 'approved' ? 'Aprovado' : 'Recusado' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Notification -->
  <div
  v-if="showNotification"
  class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
  v-html="notificationMessage"
></div>


  <!-- Image Modal -->
  <div
    v-if="showImageModal"
    class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    @click="showImageModal = false"
  >
    <button
      class="absolute top-4 right-4 text-white hover:text-gray-300"
      @click="showImageModal = false"
    >
      <X class="h-8 w-8" />
    </button>
    <img
      :src="pet?.imageUrl"
      :alt="pet?.name"
      class="max-h-[90vh] max-w-[90vw] object-contain"
    />
  </div>
</template>

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
.showNotification {
  white-space: pre-line; 
}

</style>