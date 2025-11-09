<template>
  <div class="payment-form">
    <div class="page-header">
      <div>
        <h2>Criar Novo Pagamento</h2>
        <p v-if="currentProfile" class="profile-info">
          Perfil: <strong>{{ currentProfile.name }}</strong>
        </p>
      </div>
      <router-link :to="{ path: '/payments', query: { profiles: [$route.query.profileId] } }" class="btn btn-secondary">
        Voltar à Lista
      </router-link>
    </div>

    <!-- Mensagens de erro/sucesso -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="success">
      {{ successMessage }}
    </div>

    <!-- Loading do perfil -->
    <div v-if="loadingProfile" class="loading">
      Carregando perfil...
    </div>

    <!-- Botões de Ação -->
    <div v-else-if="!showForm" class="action-buttons-container">
      <div class="card">
        <div class="card-header">
          <h3>Tipo de Transação</h3>
          <p class="text-muted">Selecione o tipo de transação que deseja registrar</p>
        </div>
        <div class="action-buttons">
          <button 
            @click="selectAction('received')" 
            class="btn-action btn-received"
          >
            <div class="action-icon">💰</div>
            <div class="action-label">Recebi</div>
            <div class="action-description">Valor positivo, já pago</div>
          </button>

          <button 
            @click="selectAction('willReceive')" 
            class="btn-action btn-will-receive"
          >
            <div class="action-icon">📈</div>
            <div class="action-label">Vou receber</div>
            <div class="action-description">Valor positivo, pendente</div>
          </button>

          <button 
            @click="selectAction('paid')" 
            class="btn-action btn-paid"
          >
            <div class="action-icon">💸</div>
            <div class="action-label">Paguei</div>
            <div class="action-description">Valor negativo, já pago</div>
          </button>

          <button 
            @click="selectAction('willPay')" 
            class="btn-action btn-will-pay"
          >
            <div class="action-icon">📉</div>
            <div class="action-label">Vou pagar</div>
            <div class="action-description">Valor negativo, pendente</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Formulário em formato de tabela -->
    <div v-else class="card">
      <div class="form-header">
        <h3>{{ actionConfig[selectedAction].label }}</h3>
        <button type="button" @click="cancelForm" class="btn btn-sm btn-secondary">
          Escolher outro tipo
        </button>
      </div>

      <form @submit.prevent="createPayment" class="table-form">
        <table class="table">
          <tbody>
            <tr>
              <td class="field-label">
                <label for="amount" class="form-label required">Valor:</label>
              </td>
              <td class="field-input">
                <input 
                  id="amount"
                  v-model="form.amount" 
                  type="number" 
                  step="0.01" 
                  class="form-control"
                  placeholder="0,00"
                  required
                  @blur="validateAndFixAmount"
                >
                <small class="field-hint">
                  {{ actionConfig[selectedAction].amountType === 'positive' ? 'Valor positivo (entrada)' : 'Valor negativo (saída)' }}
                </small>
              </td>
            </tr>
            <tr>
              <td class="field-label">
                <label for="paymentDate" class="form-label required">Data de Pagamento:</label>
              </td>
              <td class="field-input">
                <input 
                  id="paymentDate"
                  v-model="form.paymentDate" 
                  type="datetime-local" 
                  class="form-control"
                  required
                >
              </td>
            </tr>
            <tr>
              <td class="field-label">
                <label for="content" class="form-label required">Conteúdo:</label>
              </td>
              <td class="field-input">
                <input 
                  id="content"
                  v-model="form.content" 
                  type="text" 
                  class="form-control"
                  placeholder="Digite o conteúdo do pagamento"
                  required
                >
              </td>
            </tr>
            <tr>
              <td class="field-label">
                <label for="description" class="form-label">Descrição:</label>
              </td>
              <td class="field-input">
                <textarea 
                  id="description"
                  v-model="form.description" 
                  class="form-control"
                  rows="3"
                  placeholder="Descrição adicional (opcional)"
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-secondary">
            Limpar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Criando...' : 'Criar Pagamento' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Tabela de Pagamentos Recentes -->
    <div class="card mt-4">
      <div class="card-header">
        <h3>Pagamentos Recentes</h3>
        <p class="text-muted">Clique em "Copiar" para preencher o formulário com os dados do pagamento</p>
      </div>
      
      <div v-if="loadingPayments" class="loading-payments">
        Carregando pagamentos...
      </div>
      
      <div v-else-if="recentPayments.length === 0" class="no-payments">
        Nenhum pagamento encontrado.
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Conteúdo</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Data de Pagamento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in recentPayments" :key="payment.id">
              <td class="content-cell">
                <span class="content-text" :title="payment.content">
                  {{ payment.content || 'Sem conteúdo' }}
                </span>
              </td>
              <td class="description-cell">
                <span v-if="payment.description" class="description-text" :title="payment.description">
                  {{ payment.description }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="amount-cell">{{ formatCurrency(payment.amount) }}</td>
              <td class="date-cell">{{ formatDate(payment.paymentDate) }}</td>
              <td class="status-cell">
                <span class="status-badge" :class="payment.completed ? 'status-completed' : 'status-pending'">
                  {{ payment.completed ? 'Pago' : 'Pendente' }}
                </span>
              </td>
              <td class="actions-cell">
                <button 
                  @click="copyPayment(payment)" 
                  class="btn btn-sm btn-outline-primary copy-btn"
                  title="Copiar dados para o formulário"
                >
                  📋 Copiar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { PaymentService } from '../services/paymentService'
import { ProfileService } from '../services/profileService'
import moment from 'moment'

export default {
  name: 'PaymentForm',
  data() {
    return {
      form: {
        content: '',
        description: '',
        amount: '',
        paymentDate: '',
        completed: false
      },
      currentProfile: null,
      loadingProfile: false,
      submitting: false,
      errorMessage: '',
      successMessage: '',
      recentPayments: [],
      loadingPayments: false,
      showForm: false,
      selectedAction: null,
      actionConfig: {
        received: { label: 'Recebi', amountType: 'positive', completed: true },
        willReceive: { label: 'Vou receber', amountType: 'positive', completed: false },
        paid: { label: 'Paguei', amountType: 'negative', completed: true },
        willPay: { label: 'Vou pagar', amountType: 'negative', completed: false }
      }
    }
  },
  async mounted() {
    const profileId = this.$route.query.profileId
    if (!profileId) {
      this.errorMessage = 'Perfil não selecionado. Redirecionando...'
      setTimeout(() => {
        this.$router.push('/')
      }, 2000)
      return
    }
    
    await this.loadCurrentProfile(profileId)
    this.setDefaultDate()
    await this.loadRecentPayments()
  },
  methods: {
    async loadCurrentProfile(profileId) {
      this.loadingProfile = true
      this.errorMessage = ''
      try {
        this.currentProfile = await ProfileService.getProfileById(parseInt(profileId))
      } catch (error) {
        this.errorMessage = error.message
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      } finally {
        this.loadingProfile = false
      }
    },

    selectAction(actionKey) {
      this.selectedAction = actionKey
      const config = this.actionConfig[actionKey]
      
      // Define os valores padrão baseados na ação
      this.form.completed = config.completed
      this.showForm = true
      
      // Se já havia um valor, ajusta o sinal baseado na nova ação
      if (this.form.amount) {
        const absoluteValue = Math.abs(parseFloat(this.form.amount))
        this.form.amount = config.amountType === 'negative' ? (-absoluteValue).toString() : absoluteValue.toString()
      }
      
      this.setDefaultDate()
    },

    setDefaultDate() {
      // Define a data padrão como agora
      this.form.paymentDate = moment().format('YYYY-MM-DDTHH:mm')
    },



    async createPayment() {
      this.submitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const paymentData = {
          profileId: this.currentProfile.id,
          content: this.form.content,
          description: this.form.description || null,
          amount: parseFloat(this.form.amount),
          paymentDate: new Date(this.form.paymentDate).toISOString(),
          completed: this.form.completed
        }

        const result = await PaymentService.createPayment(paymentData)

        this.successMessage = 'Pagamento criado com sucesso!'
        this.resetForm()
        
        // Atualiza a lista de pagamentos recentes
        await this.loadRecentPayments()

        // Remove a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)

      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.submitting = false
      }
    },



    async loadRecentPayments() {
      if (!this.currentProfile) return
      
      this.loadingPayments = true
      try {
        const response = await PaymentService.getPayments({
          pageNumber: 1,
          pageSize: 10,
          profiles: [this.currentProfile.id]
        })
        this.recentPayments = response.items || []
      } catch (error) {
        console.error('Erro ao carregar pagamentos recentes:', error)
      } finally {
        this.loadingPayments = false
      }
    },

    copyPayment(payment) {
      // Determina qual ação selecionar baseado no pagamento
      let actionKey
      if (payment.amount > 0 && payment.completed) {
        actionKey = 'received'
      } else if (payment.amount > 0 && !payment.completed) {
        actionKey = 'willReceive'
      } else if (payment.amount < 0 && payment.completed) {
        actionKey = 'paid'
      } else if (payment.amount < 0 && !payment.completed) {
        actionKey = 'willPay'
      }

      // Seleciona a ação correspondente
      this.selectedAction = actionKey
      this.showForm = true

      // Preenche o formulário com os dados do pagamento selecionado
      this.form = {
        content: payment.content || '',
        description: payment.description || '',
        amount: payment.amount.toString(),
        paymentDate: moment().format('YYYY-MM-DDTHH:mm'), // Nova data/hora
        completed: payment.completed
      }

      this.successMessage = `Dados copiados do pagamento "${payment.content || 'sem conteúdo'}"! Ajuste conforme necessário.`
      setTimeout(() => this.successMessage = '', 3000)
      
      // Scroll para o topo do formulário
      this.$el.scrollIntoView({ behavior: 'smooth' })
    },



    formatCurrency(amount) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount)
    },

    formatDate(dateString) {
      return moment(dateString).format('DD/MM/YYYY HH:mm')
    },

    validateAndFixAmount() {
      if (!this.selectedAction || !this.form.amount) return

      const config = this.actionConfig[this.selectedAction]
      const value = parseFloat(this.form.amount)
      
      if (isNaN(value)) return

      const absoluteValue = Math.abs(value)
      
      if (config.amountType === 'negative' && value > 0) {
        this.form.amount = (-absoluteValue).toString()
      } else if (config.amountType === 'positive' && value < 0) {
        this.form.amount = absoluteValue.toString()
      }
    },

    resetForm() {
      this.form = {
        content: '',
        description: '',
        amount: '',
        paymentDate: moment().format('YYYY-MM-DDTHH:mm'),
        completed: false
      }
      this.showForm = false
      this.selectedAction = null
      this.errorMessage = ''
      this.successMessage = ''
    },

    cancelForm() {
      this.resetForm()
    }
  }
}
</script>

<style scoped>
.payment-form {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50;
}

.profile-info {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.table-form .table {
  margin-bottom: 0;
}

.table-form .table td {
  vertical-align: middle;
  padding: 1rem;
}

.field-label {
  width: 200px;
  background-color: #f8f9fa;
  font-weight: 500;
  border-right: 2px solid #dee2e6;
}

.field-input {
  width: auto;
}

.form-label {
  margin: 0;
  color: #495057;
}

.form-label.required::after {
  content: " *";
  color: #dc3545;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}



.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estilos para os botões de ação */
.action-buttons-container {
  margin-bottom: 2rem;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.btn-action {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.btn-received:hover {
  border-color: #28a745;
  background-color: #f8fff9;
}

.btn-will-receive:hover {
  border-color: #17a2b8;
  background-color: #f1fbfc;
}

.btn-paid:hover {
  border-color: #dc3545;
  background-color: #fdf2f2;
}

.btn-will-pay:hover {
  border-color: #fd7e14;
  background-color: #fff8f0;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.action-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.action-description {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.3;
}

/* Estilos para o cabeçalho do formulário */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 0.375rem 0.375rem 0 0;
}

.form-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
}

.field-hint {
  color: #6c757d;
  font-style: italic;
  margin-top: 0.25rem;
  display: block;
}

/* Estilos para a tabela de pagamentos recentes */
.mt-4 {
  margin-top: 2rem;
}

.card-header {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 0.375rem 0.375rem 0 0;
}

.card-header h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.card-header .text-muted {
  margin: 0;
  font-size: 0.875rem;
}

.loading-payments,
.no-payments {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

.table-responsive {
  margin: 0;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
  color: #495057;
  padding: 0.75rem;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
}



.content-cell,
.description-cell {
  max-width: 200px;
}

.content-text,
.description-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-cell {
  font-weight: 600;
  color: #28a745;
  text-align: right;
}

.date-cell {
  font-size: 0.875rem;
  color: #6c757d;
}

.status-cell {
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.actions-cell {
  text-align: center;
  width: 100px;
}

.copy-btn {
  font-size: 0.75rem;
  padding: 0.375rem 0.5rem;
  white-space: nowrap;
}

.copy-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  color: white;
}

@media (max-width: 768px) {
  .payment-form {
    max-width: 100%;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-form .table,
  .table-form .table tbody,
  .table-form .table tr,
  .table-form .table td {
    display: block;
    width: 100%;
  }

  .table-form .table tr {
    margin-bottom: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    overflow: hidden;
  }

  .field-label {
    background-color: #f8f9fa;
    padding: 0.5rem 1rem;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }

  .field-input {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  /* Responsivo para os botões de ação */
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }

  .btn-action {
    padding: 1rem;
  }

  .action-icon {
    font-size: 1.5rem;
  }

  .action-label {
    font-size: 1rem;
  }

  .action-description {
    font-size: 0.8rem;
  }

  .form-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .form-header h3 {
    font-size: 1.1rem;
  }

  /* Responsivo para a tabela de pagamentos */
  .table-responsive {
    overflow-x: auto;
  }

  .content-cell,
  .description-cell {
    max-width: 150px;
  }

  .copy-btn {
    font-size: 0.7rem;
    padding: 0.25rem 0.375rem;
  }
}
</style>