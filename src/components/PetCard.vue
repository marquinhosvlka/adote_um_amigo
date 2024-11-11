<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  pet: {
    id: string
    name: string
    species: string
    breed: string
    age: number
    size: string
    city: string
    state: string
    imageUrl: string 
    status: string
  }
}>()
</script>

<template>
  <div class="card hover:shadow-lg transition-shadow">
    <img 
      :src="pet.imageUrl" 
      :alt="pet.name"
      class="w-full h-48 object-cover rounded-t-lg"
    />
    <div class="p-4">
      <h3 class="text-xl font-bold text-primary">{{ pet.name }}</h3>
      <div class="mt-2 space-y-1">
        <p class="text-gray-600">{{ pet.breed }} • {{ pet.age }} anos</p>
        <p class="text-gray-600">{{ pet.city }}, {{ pet.state }}</p>
      </div>
      <router-link 
        :to="'/pet/' + pet.id"
        class="btn-primary block text-center mt-4"
      >
        Ver detalhes
      </router-link>
    </div>
  </div>
</template>
