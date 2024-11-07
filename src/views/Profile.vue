<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import PetCard from '../components/PetCard.vue'

const authStore = useAuthStore()
const myPets = ref([])
const loading = ref(true)

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

onMounted(fetchMyPets)
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary mb-2">Meu Perfil</h1>
      <div v-if="authStore.userData" class="card mb-6">
        <h2 class="text-xl font-semibold mb-4">Informações Pessoais</h2>
        <div class="space-y-2">
          <p><span class="font-medium">Nome:</span> {{ authStore.userData.name }}</p>
          <p><span class="font-medium">Email:</span> {{ authStore.userData.email }}</p>
          <p><span class="font-medium">Telefone:</span> {{ authStore.userData.phone }}</p>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold text-primary mb-4">Meus Pets Anunciados</h2>
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Carregando...</p>
      </div>
      <div v-else-if="myPets.length === 0" class="text-center py-8">
        <p class="text-gray-600">Você ainda não anunciou nenhum pet.</p>
        <router-link to="/create-pet" class="btn-primary inline-block mt-4">
          Anunciar um Pet
        </router-link>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PetCard v-for="pet in myPets" :key="pet.id" :pet="pet" />
      </div>
    </div>
  </div>
</template>