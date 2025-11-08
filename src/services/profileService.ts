import apiClient from './api'
import type { Profile } from '../types'

export const ProfileService = {
  // Buscar todos os perfis
  async getProfiles() {
    try {
      const response = await apiClient.get('/profiles')
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao buscar perfis: ${error.response?.data?.message || error.message}`)
    }
  },

  // Buscar perfil por ID
  async getProfileById(id: number) {
    try {
      const response = await apiClient.get(`/profiles/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao buscar perfil: ${error.response?.data?.message || error.message}`)
    }
  },

  // Criar novo perfil
  async createProfile(profileData: any) {
    try {
      const response = await apiClient.post('/profiles', profileData)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao criar perfil: ${error.response?.data?.message || error.message}`)
    }
  },

  // Deletar perfil
  async deleteProfile(id: number) {
    try {
      const response = await apiClient.delete(`/profiles/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao deletar perfil: ${error.response?.data?.message || error.message}`)
    }
  }
}