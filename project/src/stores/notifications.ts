import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<any[]>([]);

  const addNotification = async (userId: string, notification: {
    type: 'adoption_request' | 'adoption_approved' | 'adoption_rejected';
    message: string;
    petId?: string;
    read?: boolean;
  }) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...notification,
        read: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const fetchUserNotifications = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      notifications.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return notifications.value;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      
      // Atualiza o estado local
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.value[index].read = true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      
      // Remove do estado local
      notifications.value = notifications.value.filter(n => n.id !== notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    addNotification,
    fetchUserNotifications,
    markAsRead,
    deleteNotification,
  };
});