<script setup lang="ts">
import { defineProps } from 'vue'

// Definindo as propriedades para o componente
defineProps<{
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
    <div class="image-container">
      <img 
        :src="pet.imageUrl" 
        :alt="pet.name"
        class="pet-image"
      />
    </div>
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

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.image-container {
  width: 100%; /* Garante que o container da imagem ocupe toda a largura */
  height: 200px; /* Define uma altura fixa para o container */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5; /* Fundo cinza claro para contraste */
  overflow: hidden;
}

.pet-image {
  max-width: 100%; /* Impede que a largura da imagem ultrapasse o container */
  max-height: 100%; /* Impede que a altura ultrapasse o container */
  object-fit: contain; /* Redimensiona proporcionalmente a imagem */
}
</style>
