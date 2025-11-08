<template>
  <div class="payments-summary">
    <!-- Navegação Breadcrumb -->
    <nav class="breadcrumb-nav">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/">Perfis</router-link>
        </li>
        <li class="breadcrumb-item" v-if="selectedProfile">
          {{ selectedProfile.name }}
        </li>
        <li class="breadcrumb-item" v-if="selectedMonth && selectedYear">
          {{ getMonthName(selectedMonth) }}
        </li>
        <li class="breadcrumb-item" v-if="selectedYear">
          {{ selectedYear }}
        </li>
      </ol>
    </nav>

    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>Resumo de Pagamentos</h1>
          <p v-if="selectedProfile" class="profile-subtitle">
            Perfil: <strong>{{ selectedProfile.name }}</strong>
          </p>
        </div>
        <button @click="$router.push('/')" class="btn btn-outline-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Trocar Perfil
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <h3>Filtros</h3>
      <form @submit.prevent="loadSummary" class="filters-form">
        <div class="filters-row">
          <div class="form-group">
            <label class="form-label">Ano Inicial:</label>
            <select v-model="filters.startYear" class="form-control">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Mês Inicial:</label>
            <select v-model="filters.startMonth" class="form-control">
              <option v-for="(monthName, monthNumber) in monthsOptions" :key="monthNumber" :value="monthNumber">
                {{ monthName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Ano Final:</label>
            <select v-model="filters.endYear" class="form-control">
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Mês Final:</label>
            <select v-model="filters.endMonth" class="form-control">
              <option v-for="(monthName, monthNumber) in monthsOptions" :key="monthNumber" :value="monthNumber">
                {{ monthName }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="filters-actions">
          <button type="submit" class="btn btn-primary">
            Atualizar Resumo
          </button>
          <button type="button" @click="clearFilters" class="btn btn-secondary">
            Limpar Filtros
          </button>
        </div>
      </form>
    </div>

    <!-- Mensagens de erro -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner">Carregando resumo...</div>
    </div>

    <!-- Tabela de Resumo -->
    <div v-else-if="summaryData.length > 0" class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Perfil</th>
            <th>Período</th>
            <th>Entradas</th>
            <th>Saídas</th>
            <th>Balanço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaryData" :key="`${item.profileId}-${item.year}-${item.month}`">
            <td>
              <span class="profile-badge">
                {{ item.profileName }}
              </span>
            </td>
            <td>{{ getMonthName(item.month) }} {{ item.year }}</td>
            <td class="amount-in">{{ formatCurrency(item.totalAmountIn) }}</td>
            <td class="amount-out">{{ formatCurrency(item.totalAmountOut) }}</td>
            <td :class="getBalanceClass(item.totalAmountIn + item.totalAmountOut)">
              {{ formatCurrency(item.totalAmountIn + item.totalAmountOut) }}
            </td>
            <td>
              <button 
                @click="navigateToPayments(item)" 
                class="btn btn-primary btn-sm"
                title="Ver Pagamentos"
              >
                Entrar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!loading" class="empty-state">
      <p>Nenhum dado encontrado para o período selecionado.</p>
    </div>
  </div>
</template>

<script>
import { PaymentService } from '../services/paymentService'
import { ProfileService } from '../services/profileService'

// Função auxiliar para calcular datas iniciais do filtro
function getInitialFilterDates() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() retorna 0-11, precisamos 1-12
  
  // Mês anterior
  let startYear = currentYear
  let startMonth = currentMonth - 1
  
  if (startMonth === 0) {
    startMonth = 12
    startYear = currentYear - 1
  }
  
  // 10 meses à frente do mês atual
  let endYear = currentYear
  let endMonth = currentMonth + 10
  
  if (endMonth > 12) {
    endYear = currentYear + Math.floor((endMonth - 1) / 12)
    endMonth = ((endMonth - 1) % 12) + 1
  }
  
  return { startYear, startMonth, endYear, endMonth }
}

export default {
  name: 'PaymentsSummary',
  data() {
    const initialDates = getInitialFilterDates()
    
    return {
      summaryData: [],
      loading: false,
      errorMessage: '',
      availableProfiles: [],
      selectedProfile: null,
      selectedMonth: null,
      selectedYear: null,
      filters: {
        selectedProfiles: [],
        startYear: initialDates.startYear,
        startMonth: initialDates.startMonth,
        endYear: initialDates.endYear,
        endMonth: initialDates.endMonth
      },
      monthsOptions: {
        1: 'Janeiro',
        2: 'Fevereiro', 
        3: 'Março',
        4: 'Abril',
        5: 'Maio',
        6: 'Junho',
        7: 'Julho',
        8: 'Agosto',
        9: 'Setembro',
        10: 'Outubro',
        11: 'Novembro',
        12: 'Dezembro'
      }
    }
  },
  computed: {
    availableYears() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        years.push(year)
      }
      return years.reverse()
    }
  },
  async mounted() {
    await this.loadProfiles()
    this.handleFiltersFromQuery()
    await this.loadSummary()
    this.updateBreadcrumb()
  },
  methods: {
    async loadProfiles() {
      try {
        const response = await ProfileService.getProfiles()
        this.availableProfiles = response.items || response || []
      } catch (error) {
        console.error('Erro ao carregar perfis:', error.message)
      }
    },

    handleFiltersFromQuery() {
      const query = this.$route.query
      
      // Se há um profileId na query, configurar os filtros
      if (query.profileId) {
        this.filters.selectedProfiles = [parseInt(query.profileId)]
      }
      
      // Se há filtros vindos do PaymentsList (quando navega de volta)
      if (query.profiles) {
        const profiles = Array.isArray(query.profiles) ? query.profiles : [query.profiles]
        this.filters.selectedProfiles = profiles.map(p => parseInt(p))
      }
      
      // Se há filtros de ano/mês específicos, ajustar o período para mostrar apenas esse mês
      if (query.year && query.month) {
        const year = parseInt(query.year)
        const month = parseInt(query.month)
        
        this.filters.startYear = year
        this.filters.startMonth = month
        this.filters.endYear = year
        this.filters.endMonth = month
      }
    },

    async loadSummary() {
      this.loading = true
      this.errorMessage = ''
      try {
        const filterParams = {
          startYear: this.filters.startYear,
          startMonth: this.filters.startMonth,
          endYear: this.filters.endYear,
          endMonth: this.filters.endMonth
        }

        if (this.filters.selectedProfiles.length > 0) {
          filterParams.profiles = this.filters.selectedProfiles
        }

        const response = await PaymentService.getPaymentsSummary(filterParams)
        this.summaryData = response.items || []
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loading = false
      }
    },

    clearFilters() {
      const initialDates = getInitialFilterDates()
      const profileId = this.$route.query.profileId // Preservar o profileId da query
      
      this.filters = {
        selectedProfiles: profileId ? [parseInt(profileId)] : [],
        startYear: initialDates.startYear,
        startMonth: initialDates.startMonth,
        endYear: initialDates.endYear,
        endMonth: initialDates.endMonth
      }
      this.loadSummary()
    },

    navigateToPayments(item) {
      // Navegar para PaymentsList com filtros pré-definidos
      this.$router.push({
        name: 'PaymentsList',
        query: {
          profiles: [item.profileId],
          year: item.year,
          month: item.month
        }
      })
    },

    updateBreadcrumb() {
      // Atualizar breadcrumb baseado nos filtros
      if (this.filters.selectedProfiles.length === 1) {
        this.selectedProfile = this.availableProfiles.find(p => p.id === this.filters.selectedProfiles[0])
      } else {
        this.selectedProfile = null
      }

      // Se filtros de período são específicos
      if (this.filters.startYear === this.filters.endYear && 
          this.filters.startMonth === this.filters.endMonth) {
        this.selectedYear = this.filters.startYear
        this.selectedMonth = this.filters.startMonth
      } else {
        this.selectedYear = null
        this.selectedMonth = null
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    },

    getMonthName(monthNumber) {
      return this.monthsOptions[monthNumber] || `Mês ${monthNumber}`
    },

    getBalanceClass(balance) {
      if (balance > 0) return 'amount-positive'
      if (balance < 0) return 'amount-negative'
      return 'amount-neutral'
    }
  },
  watch: {
    '$route'() {
      // Reagir a mudanças na rota (quando navegando de volta do PaymentsList)
      this.handleFiltersFromQuery()
      this.loadSummary()
      this.updateBreadcrumb()
    },
    filters: {
      handler() {
        this.updateBreadcrumb()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.payments-summary {
  max-width: 100%;
  padding: 1rem;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  list-style: none;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
}

.breadcrumb-item {
  display: flex;
}

.breadcrumb-item + .breadcrumb-item::before {
  float: left;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  color: #6c757d;
  content: ">";
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.profile-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 400;
}

.profile-subtitle strong {
  color: #2c3e50;
}

.filters-section {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.filters-form {
  margin: 0;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-size: 0.875rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-text {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.filters-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-outline-primary {
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: white;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  color: #6c757d;
  font-size: 1.1rem;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.profile-badge {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.amount-in {
  color: #28a745;
  font-weight: 600;
}

.amount-out {
  color: #dc3545;
  font-weight: 600;
}

.amount-positive {
  color: #28a745;
  font-weight: 600;
}

.amount-negative {
  color: #dc3545;
  font-weight: 600;
}

.amount-neutral {
  color: #6c757d;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .payments-summary {
    padding: 0.5rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    flex-direction: column;
  }

  .table {
    font-size: 0.8rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }

  .breadcrumb {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>