import api from './client'

interface AvailabilityResponse {
  success: boolean
  message: string
  data?: { current_time: string }[]
}


export const fetchConsoles = async () => {
  try {
    const response = await api.get<AvailabilityResponse>('/availability/consoles')
    console.log(response)
    return response?.data ?? null
  } catch (error) {
    console.error('Error fetching consoles:', error)
    return null
  }
}
