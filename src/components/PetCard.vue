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
    <div class="image-container relative">
      <div class="image-wrapper">
        <img
          :src="pet.imageUrl"
          :alt="pet.name"
          class="pet-image"
          loading="lazy"
          @error="($event) => { const target = $event.target as HTMLImageElement; target.src = '/src/assets/logo.png'; }"
        />
      </div>
      <div v-if="pet.status === 'adopted'" class="status-badge">
        Adotado
      </div>
    </div>
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary mb-2">{{ pet.name }}</h3>
        <div class="space-y-1">
          <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
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
}

.image-container {
  @apply relative w-full overflow-hidden bg-gray-100;
  height: 300px;
}

.image-wrapper {
  @apply flex items-center justify-center h-full w-full;
}

.pet-image {
  @apply max-w-full max-h-full object-contain transition-transform duration-300;
}

.card:hover .pet-image {
  @apply scale-105;
}

.status-badge {
  @apply absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold;
}

.btn-primary {
  @apply bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors inline-block;
}
</style>