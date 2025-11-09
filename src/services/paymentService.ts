import apiClient from './api'
import type { PaymentFilters, PaymentSummaryFilters, Payment, ApiError } from '../types'

export const PaymentService = {
  // Buscar todos os pagamentos com filtros opcionais
  async getPayments(filters: PaymentFilters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Adicionar filtros de query string baseados em GetPaymentsQuery
      if (filters.pageNumber) {
        params.append('pageNumber', filters.pageNumber.toString())
      }
      if (filters.pageSize) {
        params.append('pageSize', filters.pageSize.toString())
      }
      if (filters.profiles && filters.profiles.length > 0) {
        filters.profiles.forEach(profileId => {
          params.append('profiles', profileId.toString())
        })
      }
      if (filters.year) {
        params.append('year', filters.year.toString())
      }
      if (filters.month) {
        params.append('month', filters.month.toString())
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }

      const queryString = params.toString()
      const url = queryString ? `/payments?${queryString}` : '/payments'
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao buscar pagamentos: ${error.response?.data?.message || error.message}`)
    }
  },

  // Buscar pagamento por ID
  async getPaymentById(id: number) {
    try {
      const response = await apiClient.get(`/payments/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao buscar pagamento: ${error.response?.data?.message || error.message}`)
    }
  },

  // Criar novo pagamento
  async createPayment(paymentData: any) {
    try {
      const response = await apiClient.post('/payments', paymentData)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao criar pagamento: ${error.response?.data?.message || error.message}`)
    }
  },

  // Atualizar pagamento
  async updatePayment(id: number, updateData: any) {
    try {
      const response = await apiClient.put(`/payments/${id}`, updateData)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao atualizar pagamento: ${error.response?.data?.message || error.message}`)
    }
  },

  // Confirmar pagamento (atualizar status para completed = true)
  async confirmPayment(id: number) {
    try {
      const response = await apiClient.put(`/payments/${id}`, {
        completed: true
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao confirmar pagamento: ${error.response?.data?.message || error.message}`)
    }
  },

  // Deletar pagamento
  async deletePayment(id: number) {
    try {
      const response = await apiClient.delete(`/payments/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao deletar pagamento: ${error.response?.data?.message || error.message}`)
    }
  },

  // Buscar resumo de pagamentos
  async getPaymentsSummary(filters: PaymentSummaryFilters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Adicionar filtros baseados em GetPaymentsSummaryQuery
      if (filters.profiles && filters.profiles.length > 0) {
        filters.profiles.forEach(profileId => {
          params.append('profiles', profileId.toString())
        })
      }
      if (filters.startYear) {
        params.append('startYear', filters.startYear.toString())
      }
      if (filters.startMonth) {
        params.append('startMonth', filters.startMonth.toString())
      }
      if (filters.endYear) {
        params.append('endYear', filters.endYear.toString())
      }
      if (filters.endMonth) {
        params.append('endMonth', filters.endMonth.toString())
      }

      const queryString = params.toString()
      const url = queryString ? `/payments/summary?${queryString}` : '/payments/summary'
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error: any) {
      throw new Error(`Erro ao buscar resumo de pagamentos: ${error.response?.data?.message || error.message}`)
    }
  }
}