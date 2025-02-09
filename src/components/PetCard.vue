<script setup lang="ts">
defineProps<{
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    ageUnit: 'days' | 'weeks' | 'months' | 'years';
    size: string;
    city: string;
    state: string;
    imageUrl: string;
    status: string;
  };
}>();

const formatAge = (age: number, ageUnit: 'days' | 'weeks' | 'months' | 'years') => {
  const units: Record<string, string> = {
    days: 'dias',
    weeks: 'semanas',
    months: 'meses',
    years: 'anos'
  };
  return `${age} ${units[ageUnit]}`;
};
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
      <div 
        v-if="pet.status === 'adopted'" 
        class="status-badge bg-green-500"
      >
        Adotado
      </div>
      <div 
        v-else-if="pet.status === 'paused'" 
        class="status-badge bg-yellow-500"
      >
        Anúncio Pausado
      </div>
    </div>
    <div class="p-4 flex-1 flex flex-col">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary mb-2">{{ pet.name }}</h3>
        <div class="space-y-1">
          <p class="text-gray-600">{{ pet.breed }} • {{ formatAge(pet.age, pet.ageUnit) }}</p>
          <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
        </div>
      </div>
      <router-link
        :to="'/pet/' + pet.id"
        class="btn-primary block text-center mt-4 w-full"
        v-if="pet.status !== 'paused'"
      >
        Ver detalhes
      </router-link>
      <button
        v-else
        disabled
        class="btn-primary block text-center mt-4 w-full opacity-50 cursor-not-allowed"
      >
        Anúncio Pausado
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background-color: #f3f4f6;
  border-radius: 0.5rem 0.5rem 0 0;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.image-wrapper:hover {
  transform: scale(1.05);
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.status-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.card {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>