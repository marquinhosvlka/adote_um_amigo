<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db, storage } from '../firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { useAuthStore } from '../stores/auth'
import PetCard from '../components/PetCard.vue'

const authStore = useAuthStore()
const myPets = ref([])
const loading = ref(true)

// Campos do perfil
const editingProfile = ref(false)
const userName = ref(authStore.userData?.name || '')
const userEmail = ref(authStore.userData?.email || '')
const userPhone = ref(authStore.userData?.phone || '')
const userAddress = ref(authStore.userData?.address || '')
const userPhotoUrl = ref(authStore.userData?.photoUrl || '')
const newPhotoFile = ref<File | null>(null)

const fetchMyPets = async () => {
  if (!authStore.user) return
  
  try {
    const q = query(
      collection(db, 'pets'),
      where('userId', '==', authStore.user.uid)
    )
    const snapshot = await getDocs(q)
    myPets.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao buscar pets:', error)
  } finally {
    loading.value = false
  }
}

// Função para atualizar o perfil do usuário
const saveProfile = async () => {
  if (!authStore.user) return
  
  try {
    let photoUrl = userPhotoUrl.value
    
    // Se houver uma nova foto, faça o upload para o Firebase Storage
    if (newPhotoFile.value) {
      const storagePath = `profilePhotos/${authStore.user.uid}`
      const photoRef = storageRef(storage, storagePath)
      await uploadBytes(photoRef, newPhotoFile.value)
      photoUrl = await getDownloadURL(photoRef)
    }

    const userDoc = doc(db, 'users', authStore.user.uid)
    await updateDoc(userDoc, {
      name: userName.value,
      email: userEmail.value,
      phone: userPhone.value,
      address: userAddress.value,
      photoUrl
    })

    // Atualiza os dados localmente no store
    authStore.userData.name = userName.value
    authStore.userData.email = userEmail.value
    authStore.userData.phone = userPhone.value
    authStore.userData.address = userAddress.value
    authStore.userData.photoUrl = photoUrl

    editingProfile.value = false
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
  }
}

onMounted(fetchMyPets)
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary mb-2">Meu Perfil</h1>
      
      <div v-if="authStore.userData" class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Informações Pessoais</h2>
        
        <div v-if="editingProfile" class="space-y-4">
          <label class="block">
            <span class="font-medium">Nome:</span>
            <input v-model="userName" class="input" type="text" />
          </label>
          <label class="block">
            <span class="font-medium">Email:</span>
            <input v-model="userEmail" class="input" type="email" />
          </label>
          <label class="block">
            <span class="font-medium">Telefone:</span>
            <input v-model="userPhone" class="input" type="tel" />
          </label>
          <label class="block">
            <span class="font-medium">Endereço:</span>
            <input v-model="userAddress" class="input" type="text" />
          </label>
          <label class="block">
            <span class="font-medium">Foto de Perfil:</span>
            <input type="file" @change="e => newPhotoFile.value = e.target.files[0]" />
          </label>
          <button @click="saveProfile" class="btn-primary mt-4">Salvar</button>
          <button @click="editingProfile = false" class="btn-secondary mt-2">Cancelar</button>
        </div>
        
        <div v-else class="space-y-2">
          <div class="flex items-center space-x-4">
            <img v-if="authStore.userData.photoUrl" :src="authStore.userData.photoUrl" alt="Foto de Perfil" class="w-16 h-16 rounded-full" />
            <p><span class="font-medium">Nome:</span> {{ authStore.userData.name }}</p>
          </div>
          <p><span class="font-medium">Email:</span> {{ authStore.userData.email }}</p>
          <p><span class="font-medium">Telefone:</span> {{ authStore.userData.phone }}</p>
          <p><span class="font-medium">Endereço:</span> {{ authStore.userData.address || 'Não informado' }}</p>
          <button @click="editingProfile = true" class="btn-primary mt-4">Editar Perfil</button>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-primary mb-4">Meus Pets Anunciados</h2>
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Carregando...</p>
      </div>
      <div v-else-if="myPets.length === 0" class="text-center py-8">
        <p class="text-gray-600">Você ainda não anunciou nenhum pet.</p>
      </div>
      <div class="text-center mb-4">
        <router-link to="/create-pet" class="btn-primary">Anunciar um Pet</router-link>
      </div>
      <div v-if="myPets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PetCard v-for="pet in myPets" :key="pet.id" :pet="pet" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}
.btn-primary {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn-secondary {
  background-color: #ddd;
  color: black;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
</style>
