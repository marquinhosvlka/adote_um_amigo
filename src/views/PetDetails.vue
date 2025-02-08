<template>
  <div v-if="loading" class="text-center py-8">
    <p class="text-gray-600">Carregando...</p>
  </div>

  <div v-else-if="pet" class="max-w-4xl mx-auto">
    <!-- Notification -->
    <div
      v-if="showNotification"
      class="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between"
    >
      <span>{{ notificationMessage }}</span>
      <button
        @click="showNotification = false"
        class="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          :src="pet.imageUrl"
          :alt="pet.name"
          class="w-full h-64 object-cover rounded-lg shadow-md"
        />
      </div>

      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-primary">{{ pet.name }}</h1>
          <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
          <p v-if="pet.status === 'adopted'" class="text-green-500 font-bold">
            Status: Adotado
          </p>
        </div>

        <div class="card">
          <h2 class="text-xl font-semibold mb-2">Sobre {{ pet.name }}</h2>
          <p class="text-gray-700">{{ pet.description }}</p>
        </div>

        <div v-if="owner" class="card">
          <h2 class="text-xl font-semibold mb-2">Informações do Dono</h2>
          <p><strong>Nome:</strong> {{ owner.name }}</p>
          <p><strong>Telefone:</strong> {{ formatPhone(owner.phone) }}</p>
        </div>

        <!-- Lista de pedidos de adoção (visível apenas para o dono do pet) -->
        <div
          v-if="authStore.user?.uid === pet.userId && adoptionRequests.length > 0 && pet.status !== 'adopted'"
          class="card"
        >
          <h2 class="text-xl font-semibold mb-4">Pedidos de Adoção</h2>
          <div class="space-y-4">
            <div
              v-for="request in adoptionRequests"
              :key="request.id"
              class="border rounded-md p-4"
            >
              <p><strong>Nome:</strong> {{ request.adopterInfo?.name }}</p>
              <p><strong>Email:</strong> {{ request.adopterInfo?.email }}</p>
              <p><strong>Telefone:</strong> {{ formatPhone(request.adopterInfo?.phone) }}</p>
              <p><strong>Motivo:</strong> {{ request.reason }}</p>
              <div class="flex space-x-4 mt-4">
                <button
                  v-if="request.status === 'pending'"
                  @click="handleAdoptionResponse(request.id, request.adopterId, 'approved')"
                  class="btn-primary"
                >
                  Aceitar
                </button>
                <button
                  v-if="request.status === 'pending'"
                  @click="handleAdoptionResponse(request.id, request.adopterId, 'rejected')"
                  class="btn-secondary"
                >
                  Recusar
                </button>
                <span
                  v-else
                  :class="{
                    'text-green-500': request.status === 'approved',
                    'text-red-500': request.status === 'rejected'
                  }"
                >
                  {{ request.status === 'approved' ? 'Aprovado' : 'Recusado' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulário de Adoção -->
        <div
          v-if="
            authStore.user?.uid !== pet.userId &&
            pet.status !== 'adopted' &&
            !showNotification
          "
        >
          <div v-if="showAdoptionForm" class="card">
            <h3 class="text-xl font-semibold mb-4">Solicitar Adoção</h3>
            <form @submit.prevent="handleAdoptionRequest" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  v-model="adopterName"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="adopterEmail"
                  type="email"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  v-model="adopterPhone"
                  type="tel"
                  required
                  @input="adopterPhone = formatPhone(adopterPhone)"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Por que você quer adotar {{ pet.name }}?
                </label>
                <textarea
                  v-model="adoptionReason"
                  required
                  rows="4"
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
                <button type="submit" class="btn-primary">Enviar</button>
              </div>
            </form>
          </div>

          <button
            v-else
            @click="showAdoptionForm = true"
            class="btn-primary w-full"
          >
            Quero Adotar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../stores/auth';
import { useAdoptionsStore } from '../stores/adoptions';
import { useNotificationsStore } from '../stores/notifications';
import { isValidEmail, isValidPhone, isValidName, formatPhone } from '../utils/validators';
import { X } from 'lucide-vue-next';

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
      requestsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        let adopterInfo = null;
        
        if (data.adopterId) {
          try {
            const adopterDoc = await getDoc(doc(db, 'users', data.adopterId));
            if (adopterDoc.exists()) {
              adopterInfo = adopterDoc.data();
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
          id: doc.id,
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
    }, 5000);
    
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