import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '../firebase/config'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'

export const usePetsStore = defineStore('pets', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createPet = async (petData: any, imageFile: File) => {
    loading.value = true
    error.value = null
    
    try {
      // Convert image to base64
      const base64Image = await convertToBase64(imageFile)

      // Create pet document with base64 image
      const petRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        imageUrl: base64Image, // Store base64 image
        status: 'available',
        createdAt: new Date()
      })

      return petRef.id
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Helper function to convert image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const updatePetStatus = async (petId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'pets', petId), { status })
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  const deletePet = async (petId: string) => {
    try {
      await deleteDoc(doc(db, 'pets', petId))
    } catch (e: any) {
      error.value = e.message
      throw e
    }
  }

  return {
    loading,
    error,
    createPet,
    updatePetStatus,
    deletePet
  }
})
