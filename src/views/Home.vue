<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, getDocs } from 'firebase/firestore'
import PetCard from '../components/PetCard.vue'
import PetFilter from '../components/PetFilter.vue'

const pets = ref<{
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  city: string;
  state: string;
  imageUrl: string;
  status: string;
}[]>([])

const loading = ref(true)
const filters = ref({
  species: '',
  size: '',
  city: ''
})

const fetchPets = async () => {
  loading.value = true
  try {
    let q = query(collection(db, 'pets'), where('status', '==', 'available'))


    if (filters.value.species) {
      q = query(q, where('species', '==', filters.value.species))
    }
    if (filters.value.size) {
      q = query(q, where('size', '==', filters.value.size))
    }
    if (filters.value.city) {
  const city = filters.value.city
    .replace(/^\w/, (c) => c.toUpperCase()); // Primeira letra maiúscula
  q = query(
    collection(db, 'pets'),
    where('city', '>=', city),
    where('city', '<=', city + '\uf8ff')
  );
}


    const querySnapshot = await getDocs(q)
    pets.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      species: doc.data().species || '',
      breed: doc.data().breed || '',
      age: doc.data().age || 0,
      size: doc.data().size || '',
      city: doc.data().city || '',
      state: doc.data().state || '',
      imageUrl: doc.data().imageUrl || '',
      status: doc.data().status || 'available',
    }))
  } catch (error) {
    console.error('Erro ao buscar pets:', error)
  }
  loading.value = false
}

const handleFilterChange = (newFilters: { species: string; size: string; city: string }) => {
  filters.value = newFilters
  fetchPets()
}

onMounted(fetchPets)
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-primary mb-4">Encontre seu novo amigo</h1>
      <PetFilter @filter="handleFilterChange" />
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Carregando pets...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PetCard v-for="pet in pets" :key="pet.id" :pet="pet" />
    </div>
  </div>
</template>
