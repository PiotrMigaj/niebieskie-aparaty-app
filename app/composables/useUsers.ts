import { ref } from 'vue'
import type { UserDto } from '~/types/UserDto'

export const useUsers = async () => {
  const { data: userData, error } = await useFetch<UserDto>('/api/fullName')
  
  const fullName = computed(() => userData.value?.fullName ?? '')
  
  return {
    fullName,
    error
  }
}