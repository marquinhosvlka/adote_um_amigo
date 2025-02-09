import { ref } from 'vue';
import { container } from '../di/container';
import type { IAuthService } from '../core/interfaces/IAuthService';

export function useAuth() {
  const authService = container.resolve<IAuthService>('IAuthService');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      await authService.login(email, password);
    } catch (e: any) {
      error.value = 'Email ou senha incorretos';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      await authService.register(data);
    } catch (e: any) {
      error.value = e.code === 'auth/email-already-in-use'
        ? 'Este email já está em uso'
        : 'Erro ao criar conta. Tente novamente.';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e: any) {
      error.value = 'Erro ao fazer logout';
      throw e;
    }
  };

  const resetPassword = async (email: string) => {
    loading.value = true;
    error.value = null;
    try {
      await authService.resetPassword(email);
    } catch (e: any) {
      error.value = 'Erro ao enviar email de recuperação';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getCurrentUser = () => {
    return authService.getCurrentUser();
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    getCurrentUser,
    loading,
    error
  };
}