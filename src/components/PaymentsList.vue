<template>
  <div class="payments-list">
    <div class="page-header">
      <div class="page-title">
        <router-link :to="getBackToSummaryRoute" class="breadcrumb-link">← Voltar ao Resumo</router-link>
        <h2>Lista de Pagamentos</h2>
      </div>
      <router-link :to="{ path: '/create-payment', query: { profileId: $route.query.profiles ? $route.query.profiles[0] : $route.query.profileId } }" class="btn btn-primary">
        Novo Pagamento
      </router-link>
    </div>

    <!-- Cards de Resumo -->
    <div class="summary-cards" v-if="payments.length > 0">
      <div class="card total-in">
        <div class="card-header">
          <h3>Total de Entradas</h3>
        </div>
        <div class="card-body">
          <div class="card-value">{{ formatCurrency(totalAmountIn) }}</div>
          <div class="card-subtitle">Confirmadas: {{ formatCurrency(totalAmountInConfirmed) }}</div>
        </div>
      </div>

      <div class="card total-out">
        <div class="card-header">
          <h3>Total de Saídas</h3>
        </div>
        <div class="card-body">
          <div class="card-value">{{ formatCurrency(totalAmountOut) }}</div>
          <div class="card-subtitle">Confirmadas: {{ formatCurrency(totalAmountOutConfirmed) }}</div>
        </div>
      </div>

      <div class="card balance" :class="balanceClass">
        <div class="card-header">
          <h3>Balanço</h3>
        </div>
        <div class="card-body">
          <div class="card-value">{{ formatCurrency(balance) }}</div>
          <div class="card-subtitle">{{ balanceText }}</div>
        </div>
      </div>

      <div class="card balance-confirmed" :class="balanceConfirmedClass">
        <div class="card-header">
          <h3>Balanço Confirmado</h3>
        </div>
        <div class="card-body">
          <div class="card-value">{{ formatCurrency(balanceConfirmed) }}</div>
          <div class="card-subtitle">{{ balanceConfirmedText }}</div>
        </div>
      </div>
    </div>

    <!-- Mensagens de erro/sucesso -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      Carregando pagamentos...
    </div>

    <!-- Tabela de pagamentos -->
    <div v-else-if="payments.length > 0" class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="text-center">Data de Pagamento</th>
            <th>Conteúdo</th>
            <th>Descrição</th>
            <th class="text-right">Valor</th>
            <th class="text-center">Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id">
            <td class="text-center">{{ formatDate(payment.paymentDate) }}</td>
            <td>{{ payment.content }}</td>
            <td>{{ payment.description || '-' }}</td>
            <td class="text-right">{{ formatCurrency(payment.amount) }}</td>
            <td class="text-center">
              <span 
                :class="payment.completed ? 'status-badge status-completed' : 'status-badge status-pending'"
              >
                {{ payment.completed ? 'Pago' : 'Pendente' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button 
                  @click="editPayment(payment)" 
                  class="btn btn-warning btn-sm"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  v-if="!payment.completed"
                  @click="confirmPayment(payment.id)" 
                  class="btn btn-success btn-sm"
                  title="Confirmar Pagamento"
                >
                  ✅
                </button>
                <button 
                  @click="deletePayment(payment.id)" 
                  class="btn btn-danger btn-sm"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Estado vazio -->
    <div v-else class="empty-state">
      <p>Nenhum pagamento encontrado.</p>
      <router-link :to="{ path: '/create-payment', query: { profileId: $route.query.profiles ? $route.query.profiles[0] : $route.query.profileId } }" class="btn btn-primary">
        Criar Primeiro Pagamento
      </router-link>
    </div>

    <!-- Modal de Edição -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Pagamento</h3>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="updatePayment" class="edit-form">
          <div class="form-group">
            <label class="form-label">Conteúdo:</label>
            <input 
              v-model="editForm.content" 
              type="text" 
              class="form-control"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">Descrição:</label>
            <textarea 
              v-model="editForm.description" 
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Valor:</label>
            <input 
              v-model="editForm.amount" 
              type="number" 
              step="0.01" 
              class="form-control"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">Data de Pagamento:</label>
            <input 
              v-model="editForm.paymentDate" 
              type="datetime-local" 
              class="form-control"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label">
              <input 
                v-model="editForm.completed" 
                type="checkbox"
              >
              Pagamento Confirmado
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <ConfirmationModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      @confirm="handleConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script>
import { PaymentService } from '../services/paymentService'
import ConfirmationModal from './ConfirmationModal.vue'
import moment from 'moment'

export default {
  name: 'PaymentsList',
  components: {
    ConfirmationModal
  },
  data() {
    return {
      payments: [],
      summaryData: [],
      loading: false,
      errorMessage: '',
      successMessage: '',
      showEditModal: false,
      editingPayment: null,
      confirmModal: {
        show: false,
        title: '',
        message: '',
        type: 'primary',
        action: null
      },
      editForm: {
        content: '',
        description: '',
        amount: 0,
        paymentDate: '',
        completed: false
      }
    }
  },
  computed: {
    getBackToSummaryRoute() {
      // Preservar os filtros ao voltar para o resumo
      const query = {}
      
      // Se temos filtros de perfil da query atual, incluir
      if (this.$route.query.profiles) {
        query.profiles = this.$route.query.profiles
      }
      
      // // Se temos filtros de ano/mês, incluir como período
      // if (this.$route.query.year) {
      //   query.year = this.$route.query.year
      // }
      
      // if (this.$route.query.month) {
      //   query.month = this.$route.query.month
      // }
      
      return {
        path: '/summary',
        query: Object.keys(query).length > 0 ? query : undefined
      }
    },

    totalAmountIn() {
      return this.payments.filter(p => p.amount > 0).reduce((sum, payment) => sum + payment.amount, 0)
    },

    totalAmountOut() {
      return Math.abs(this.payments.filter(p => p.amount < 0).reduce((sum, payment) => sum + payment.amount, 0))
    },

    totalAmountInConfirmed() {
      return this.payments.filter(p => p.amount > 0 && p.completed).reduce((sum, payment) => sum + payment.amount, 0)
    },

    totalAmountOutConfirmed() {
      return Math.abs(this.payments.filter(p => p.amount < 0 && p.completed).reduce((sum, payment) => sum + payment.amount, 0))
    },

    balance() {
      return this.totalAmountIn - this.totalAmountOut
    },

    balanceConfirmed() {
      return this.totalAmountInConfirmed - this.totalAmountOutConfirmed
    },

    balanceClass() {
      return {
        'positive': this.balance > 0,
        'negative': this.balance < 0,
        'neutral': this.balance === 0
      }
    },

    balanceConfirmedClass() {
      return {
        'positive': this.balanceConfirmed > 0,
        'negative': this.balanceConfirmed < 0,
        'neutral': this.balanceConfirmed === 0
      }
    },

    balanceText() {
      if (this.balance > 0) return 'Superávit'
      if (this.balance < 0) return 'Déficit'
      return 'Equilibrado'
    },

    balanceConfirmedText() {
      if (this.balanceConfirmed > 0) return 'Superávit'
      if (this.balanceConfirmed < 0) return 'Déficit'
      return 'Equilibrado'
    }
  },
  async mounted() {
    this.applyQueryParams()
    await this.loadPayments()
  },
  methods: {
    async loadPayments() {
      this.loading = true
      this.errorMessage = ''
      try {
        const filterParams = {
          sortBy: 'CompletedAsc',
          pageSize: 100,
        }

        // Aplicar apenas filtros vindos da query string (navegação da home)
        const query = this.$route.query
        
        if (query.profiles) {
          const profiles = Array.isArray(query.profiles) ? query.profiles : [query.profiles]
          filterParams.profiles = profiles.map(p => parseInt(p))
        }
        
        if (query.year) {
          filterParams.year = parseInt(query.year)
        }
        
        if (query.month) {
          filterParams.month = parseInt(query.month)
        }

        const response = await PaymentService.getPayments(filterParams)
        this.payments = response.items || []
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loading = false
      }
    },

    confirmPayment(paymentId) {
      this.confirmModal = {
        show: true,
        title: 'Confirmar Pagamento',
        message: 'Deseja confirmar este pagamento? O status será alterado para "Pago".',
        type: 'success',
        action: () => this.executeConfirmPayment(paymentId)
      }
    },

    async executeConfirmPayment(paymentId) {
      try {
        await PaymentService.confirmPayment(paymentId)
        this.successMessage = 'Pagamento confirmado com sucesso!'
        await this.loadPayments()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = error.message
      }
    },

    deletePayment(paymentId) {
      this.confirmModal = {
        show: true,
        title: 'Deletar Pagamento',
        message: 'Deseja deletar este pagamento? Esta ação não pode ser desfeita.',
        type: 'danger',
        action: () => this.executeDeletePayment(paymentId)
      }
    },

    async executeDeletePayment(paymentId) {
      try {
        await PaymentService.deletePayment(paymentId)
        this.successMessage = 'Pagamento deletado com sucesso!'
        await this.loadPayments()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = error.message
      }
    },

    editPayment(payment) {
      this.editingPayment = payment
      this.editForm = {
        content: payment.content,
        description: payment.description || '',
        amount: payment.amount,
        paymentDate: moment(payment.paymentDate).format('YYYY-MM-DDTHH:mm'),
        completed: payment.completed
      }
      this.showEditModal = true
    },

    closeEditModal() {
      this.showEditModal = false
      this.editingPayment = null
      this.errorMessage = ''
    },

    async updatePayment() {
      try {
        const updateData = {
          content: this.editForm.content,
          description: this.editForm.description || null,
          amount: parseFloat(this.editForm.amount),
          paymentDate: new Date(this.editForm.paymentDate).toISOString(),
          completed: this.editForm.completed
        }

        await PaymentService.updatePayment(this.editingPayment.id, updateData)
        this.successMessage = 'Pagamento atualizado com sucesso!'
        this.closeEditModal()
        await this.loadPayments()
        setTimeout(() => this.successMessage = '', 3000)
      } catch (error) {
        this.errorMessage = error.message
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },

    formatDate(dateString) {
      return moment(dateString).format('DD MMM')
    },

    handleConfirmAction() {
      if (this.confirmModal.action) {
        this.confirmModal.action()
      }
      this.closeConfirmModal()
    },

    closeConfirmModal() {
      this.confirmModal = {
        show: false,
        title: '',
        message: '',
        type: 'primary',
        action: null
      }
    },

    applyQueryParams() {
      // Este método agora apenas força o recarregamento quando há mudanças na rota
      // Os filtros são aplicados diretamente no loadPayments()
    }
  },
  watch: {
    '$route'() {
      // Reagir a mudanças na rota (quando navegando de volta do resumo)
      this.applyQueryParams()
      this.loadPayments()
    }
  }
}
</script>

<style scoped>
.payments-list {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 0.75rem 1rem 0.25rem;
  border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.card-body {
  padding: 0.75rem 1rem 1rem;
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.75rem;
  color: #6c757d;
}

.total-in .card-value {
  color: #28a745;
}

.total-out .card-value {
  color: #dc3545;
}

.balance.positive .card-value {
  color: #28a745;
}

.balance.negative .card-value {
  color: #dc3545;
}

.balance.neutral .card-value {
  color: #6c757d;
}

.balance-confirmed.positive .card-value {
  color: #28a745;
}

.balance-confirmed.negative .card-value {
  color: #dc3545;
}

.balance-confirmed.neutral .card-value {
  color: #6c757d;
}

.table-container {
  overflow-x: auto;
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

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f8f9fa;
  border-radius: 50%;
}

.edit-form {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .actions {
    flex-direction: column;
  }

  .table {
    font-size: 0.875rem;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .card-value {
    font-size: 1.1rem;
  }
  
  .card-header h3 {
    font-size: 0.75rem;
  }
}
</style>