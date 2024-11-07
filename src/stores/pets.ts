import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, storage } from '../firebase/config'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export const usePetsStore = defineStore('pets', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createPet = async (petData: any, imageFile: File) => {
    loading.value = true
    error.value = null
    
    try {
      // Upload image
      const imageRef = storageRef(storage, `pets/${Date.now()}-${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      // Create pet document
      const petRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        imageUrl,
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