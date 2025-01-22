<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, getDoc, collection, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pet = ref<any>(null)
const owner = ref<any>(null)
const loading = ref(true)
const showAdoptionForm = ref(false)
const adoptionRequests = ref<any[]>([])
const adoptionReason = ref('')
const adopterName = ref('')
const adopterEmail = ref('')
const adopterPhone = ref('')
const error = ref('')

// Carrega os detalhes do pet e do dono
const fetchPetDetails = async () => {
  try {
    const petDoc = await getDoc(doc(db, 'pets', route.params.id as string))
    if (petDoc.exists()) {
      pet.value = { id: petDoc.id, ...petDoc.data() }
      const ownerDoc = await getDoc(doc(db, 'users', pet.value.userId))
      owner.value = ownerDoc.data()

      // Carregar pedidos de adoção
      const requestsSnapshot = await getDocs(collection(db, `pets/${pet.value.id}/adoptionRequests`))
      adoptionRequests.value = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error)
  } finally {
    loading.value = false
  }
}

// Envia a solicitação de adoção
const handleAdoptionRequest = async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  try {
    await addDoc(collection(db, `pets/${pet.value.id}/adoptionRequests`), {
      adopterName: adopterName.value,
      adopterEmail: adopterEmail.value,
      adopterPhone: adopterPhone.value,
      reason: adoptionReason.value,
      status: 'pending',
      createdAt: new Date()
    })

    showAdoptionForm.value = false
    adopterName.value = ''
    adopterEmail.value = ''
    adopterPhone.value = ''
    adoptionReason.value = ''
    fetchPetDetails() // Atualiza a lista de pedidos
  } catch (e) {
    error.value = 'Erro ao enviar solicitação. Tente novamente.'
  }
}

// Aceitar um pedido de adoção
const acceptAdoptionRequest = async (requestId: string) => {
  try {
    // Atualiza o status do pet para "adotado"
    await updateDoc(doc(db, 'pets', pet.value.id), { status: 'adotado' })
    pet.value.status = 'adotado'

    // Atualiza o pedido de adoção como "aceito"
    await updateDoc(doc(db, `pets/${pet.value.id}/adoptionRequests/${requestId}`), { status: 'accepted' })

    fetchPetDetails()
  } catch (e) {
    error.value = 'Erro ao aceitar o pedido. Tente novamente.'
  }
}

// Recusar um pedido de adoção
const declineAdoptionRequest = async (requestId: string) => {
  try {
    await deleteDoc(doc(db, `pets/${pet.value.id}/adoptionRequests/${requestId}`))
    fetchPetDetails()
  } catch (e) {
    error.value = 'Erro ao recusar o pedido. Tente novamente.'
  }
}

onMounted(fetchPetDetails)
</script>

<template>
  <div v-if="loading" class="text-center py-8">
    <p class="text-gray-600">Carregando...</p>
  </div>

  <div v-else-if="pet" class="max-w-4xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img :src="pet.imageUrl" :alt="pet.name" class="pet-image" />
      </div>

      <div class="space-y-6">
        <div>
          <h1 class="text-3xl font-bold text-primary">{{ pet.name }}</h1>
          <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
          <p v-if="pet.status === 'adotado'" class="text-green-500 font-bold">
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
          <p><strong>Telefone:</strong> {{ owner.phone }}</p>
        </div>

        <!-- Lista de pedidos de adoção -->
        <div v-if="authStore.user?.uid === pet.userId && adoptionRequests.length && pet.status !== 'adotado'" class="card">
          <h2 class="text-xl font-semibold mb-2">Pedidos de Adoção</h2>
          <ul class="space-y-4">
            <li v-for="request in adoptionRequests" :key="request.id" class="border rounded-md p-4">
              <p><strong>Nome:</strong> {{ request.adopterName }}</p>
              <p><strong>Email:</strong> {{ request.adopterEmail }}</p>
              <p><strong>Telefone:</strong> {{ request.adopterPhone }}</p>
              <p><strong>Motivo:</strong> {{ request.reason }}</p>
              <div class="flex space-x-4 mt-2">
                <button @click="acceptAdoptionRequest(request.id)" class="btn-primary">
                  Aceitar
                </button>
                <button @click="declineAdoptionRequest(request.id)" class="btn-primary bg-red-500">
                  Recusar
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Botão e Formulário de Adoção -->
        <div v-else-if="authStore.user?.uid !== pet.userId && pet.status !== 'adotado'">
          <a v-if="owner && owner.phone" :href="`https://wa.me/+55${owner.phone.replace(/\D/g, '')}`" target="_blank"
            class="btn-primary w-full">
            Quero Adotar via WhatsApp
          </a>

          <div v-if="showAdoptionForm" class="card">
            <h3 class="text-lg font-semibold mb-4">Solicitar Adoção</h3>
            <form @submit.prevent="handleAdoptionRequest">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nome</label>
                  <input v-model="adopterName" required type="text" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input v-model="adopterEmail" required type="email" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telefone</label>
                  <input v-model="adopterPhone" required type="tel" class="input-primary" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Por que você quer adotar {{ pet.name }}?</label>
                  <textarea v-model="adoptionReason" required rows="4" class="input-primary"></textarea>
                </div>
                <p v-if="error" class="text-red-500">{{ error }}</p>
                <div class="flex justify-end space-x-4">
                  <button type="button" @click="showAdoptionForm = false" class="btn-primary bg-gray-500">
                    Cancelar
                  </button>
                  <button type="submit" class="btn-primary">Enviar</button>
                </div>
              </div>
            </form>
          </div>

          <button v-else @click="showAdoptionForm = true" class="btn-primary w-full">
            Quero Adotar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pet-image {
  width: 100%;
  height: 24rem;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.btn-primary {
  background-color: #009951;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-primary:hover {
  background-color: #007c40;
}
.input-primary {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
