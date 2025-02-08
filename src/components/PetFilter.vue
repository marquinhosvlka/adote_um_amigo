<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['filter']);

const filters = ref({
  species: '',
  size: '',
  city: '',
});

const species = ['Cachorro', 'Gato', 'Outros'];
const sizes = ['Pequeno', 'Médio', 'Grande'];

watch(
  filters,
  (newFilters) => {
    emit('filter', newFilters);
  },
  { deep: true }
);
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Espécie</label>
        <select
          v-model="filters.species"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
        >
          <option value="">Todas</option>
          <option v-for="specie in species" :key="specie" :value="specie">
            {{ specie }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Porte</label>
        <select
          v-model="filters.size"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
        >
          <option value="">Todos</option>
          <option v-for="size in sizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Cidade</label>
        <input
          type="text"
          v-model="filters.city"
          placeholder="Digite uma cidade"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
        />
      </div>
    </div>
  </div>
</template>
