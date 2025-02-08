import { ref, Ref } from 'vue';
import { User } from '../core/entities/User';
import { UserService } from '../services/UserService';

export function useUsers() {
  const user: Ref<User | null> = ref(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const userService = new UserService();

  const fetchUser = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      user.value = await userService.getUser(id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (id: string, data: any) => {
    loading.value = true;
    error.value = null;

    try {
      user.value = await userService.updateUser(id, data);
      return user.value;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser
  };
}