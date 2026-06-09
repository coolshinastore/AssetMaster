import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', null, {
          withCredentials: true,
        })
        localStorage.setItem('accessToken', data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
