import { ref } from 'vue'
import type { UserDto } from '~/types/UserDto'

export const useUsers = () => {
  const { data: userData, error } = useFetch<UserDto>('/api/fullName')
  
  const fullName = computed(() => userData.value?.fullName ?? '')
  
  return {
    fullName,
    error
  }
}