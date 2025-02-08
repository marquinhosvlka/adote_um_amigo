<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { X } from 'lucide-vue-next';

const router = useRouter();

const props = defineProps<{
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  petId?: string;
  read?: boolean;
}>();

const emit = defineEmits(['close', 'markAsRead']);
const visible = ref(true);

onMounted(() => {
  if (props.duration) {
    setTimeout(() => {
      visible.value = false;
      emit('close');
    }, props.duration);
  }
});

const getBackgroundColor = () => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    case 'info':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const handleClick = () => {
  if (props.petId) {
    emit('markAsRead', props.id);
    router.push(`/pet/${props.petId}`);
  }
};

const handleClose = (e: Event) => {
  e.stopPropagation();
  emit('close');
};
</script>

<template>
  <Transition name="notification">
    <div
      v-if="visible"
      :class="[
        'fixed p-4 rounded-lg text-white shadow-lg z-50 max-w-md cursor-pointer transition-opacity flex items-center justify-between',
        getBackgroundColor(),
        { 'opacity-75': props.read }
      ]"
      @click="handleClick"
    >
      <p class="mr-4">{{ message }}</p>
      <button
        @click="handleClose"
        class="text-white hover:text-gray-200 focus:outline-none p-1"
      >
        <X class="h-5 w-5" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>