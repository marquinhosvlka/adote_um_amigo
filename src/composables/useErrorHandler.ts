import { ref } from 'vue';

export function useErrorHandler() {
  const error = ref<string | null>(null);

  const handleError = (e: unknown) => {
    if (e instanceof Error) {
      error.value = e.message;
    } else if (typeof e === 'string') {
      error.value = e;
    } else {
      error.value = 'Ocorreu um erro inesperado';
    }
    console.error(e);
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    error,
    handleError,
    clearError,
  };
}