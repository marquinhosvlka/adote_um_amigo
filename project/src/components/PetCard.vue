<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  pet: {
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
  };
}>();
</script>

<template>
  <div class="card h-full flex flex-col">
    <div class="image-container">
      <img :src="pet.imageUrl" :alt="pet.name" class="pet-image" />
    </div>
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary mb-2">{{ pet.name }}</h3>
        <div class="space-y-1">
          <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
          <p v-if="pet.status === 'adopted'" class="text-green-500 font-semibold mt-2">
            Adotado
          </p>
        </div>
      </div>
      <router-link
        :to="'/pet/' + pet.id"
        class="btn-primary block text-center mt-4 w-full"
      >
        Ver detalhes
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg;
  height: 100%;
}

.image-container {
  @apply w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden;
}

.pet-image {
  @apply w-full h-full object-cover;
}

.btn-primary {
  @apply bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors inline-block;
}
</style>