<template>
  <div class="payment-form">
    <div class="page-header">
      <h2>Criar Novo Pagamento</h2>
      <router-link to="/payments" class="btn btn-secondary">
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

    <!-- Loading dos perfis -->
    <div v-if="loadingProfiles" class="loading">
      Carregando perfis...
    </div>

    <!-- Formulário em formato de tabela -->
    <div v-else class="card">
      <form @submit.prevent="createPayment" class="table-form">
        <table class="table">
          <tbody>
            <tr>
              <td class="field-label">
                <label for="profileId" class="form-label required">Perfil:</label>
              </td>
              <td class="field-input">
                <select 
                  id="profileId"
                  v-model="form.profileId" 
                  class="form-control"
                  required
                >
                  <option value="">Selecione um perfil</option>
                  <option 
                    v-for="profile in profiles" 
                    :key="profile.id" 
                    :value="profile.id"
                  >
                    {{ profile.name }}
                  </option>
                </select>
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
                  min="0"
                  class="form-control"
                  placeholder="0,00"
                  required
                >
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
                <label for="completed" class="form-label">Status:</label>
              </td>
              <td class="field-input">
                <label class="checkbox-container">
                  <input 
                    id="completed"
                    v-model="form.completed" 
                    type="checkbox"
                  >
                  <span class="checkmark"></span>
                  Pagamento já foi realizado
                </label>
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

      <!-- Botão de duplicar (aparece embaixo) -->
      <div v-if="showDuplicateButton" class="duplicate-section">
        <hr class="divider">
        <button @click="duplicatePayment" class="btn btn-warning duplicate-btn">
          🔄 Duplicar Pagamento
        </button>
        <p class="duplicate-help">
          Clique para duplicar os dados do último pagamento criado
        </p>
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
        profileId: '',
        content: '',
        description: '',
        amount: '',
        paymentDate: '',
        completed: false
      },
      profiles: [],
      loadingProfiles: false,
      submitting: false,
      errorMessage: '',
      successMessage: '',
      lastCreatedPayment: null,
      showDuplicateButton: false
    }
  },
  async mounted() {
    await this.loadProfiles()
    this.setDefaultDate()
    this.checkForLastPayment()
  },
  methods: {
    async loadProfiles() {
      this.loadingProfiles = true
      this.errorMessage = ''
      try {
        const response = await ProfileService.getProfiles()
        this.profiles = response.items || []
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.loadingProfiles = false
      }
    },

    setDefaultDate() {
      // Define a data padrão como agora
      this.form.paymentDate = moment().format('YYYY-MM-DDTHH:mm')
    },

    checkForLastPayment() {
      // Verifica se há um último pagamento salvo no localStorage
      const lastPayment = localStorage.getItem('lastCreatedPayment')
      if (lastPayment) {
        this.lastCreatedPayment = JSON.parse(lastPayment)
        this.showDuplicateButton = true
      }
    },

    async createPayment() {
      this.submitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const paymentData = {
          profileId: parseInt(this.form.profileId),
          content: this.form.content,
          description: this.form.description || null,
          amount: parseFloat(this.form.amount),
          paymentDate: new Date(this.form.paymentDate).toISOString(),
          completed: this.form.completed
        }

        const result = await PaymentService.createPayment(paymentData)
        
        // Salva o último pagamento criado para duplicação
        localStorage.setItem('lastCreatedPayment', JSON.stringify({
          ...paymentData,
          id: result.id
        }))

        this.successMessage = 'Pagamento criado com sucesso!'
        this.resetForm()
        this.checkForLastPayment()

        // Redireciona após 2 segundos
        setTimeout(() => {
          this.$router.push('/payments')
        }, 2000)

      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.submitting = false
      }
    },

    duplicatePayment() {
      if (!this.lastCreatedPayment) return

      // Preenche o formulário com os dados do último pagamento
      this.form = {
        profileId: this.lastCreatedPayment.profileId.toString(),
        content: this.lastCreatedPayment.content,
        description: this.lastCreatedPayment.description || '',
        amount: this.lastCreatedPayment.amount.toString(),
        paymentDate: moment().format('YYYY-MM-DDTHH:mm'), // Nova data/hora
        completed: false // Sempre começa como não pago
      }

      this.successMessage = 'Dados duplicados! Ajuste conforme necessário e clique em "Criar Pagamento".'
      setTimeout(() => this.successMessage = '', 3000)
    },

    resetForm() {
      this.form = {
        profileId: '',
        content: '',
        description: '',
        amount: '',
        paymentDate: moment().format('YYYY-MM-DDTHH:mm'),
        completed: false
      }
      this.errorMessage = ''
      this.successMessage = ''
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

.duplicate-section {
  margin-top: 2rem;
  text-align: center;
}

.divider {
  border: none;
  border-top: 2px dashed #dee2e6;
  margin: 2rem 0 1rem 0;
}

.duplicate-btn {
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
  margin-bottom: 0.5rem;
}

.duplicate-help {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
  font-style: italic;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

  .duplicate-btn {
    width: 100%;
  }
}
</style>