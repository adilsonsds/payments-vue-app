<template>
  <div class="profile-selector">
    <div class="profile-container">
      <h1 class="profile-title">Quem vai cuidar das finanças?</h1>
      
      <div v-if="loading" class="loading-state">
        <LoadingSpinner />
      </div>

      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="loadProfiles" class="btn btn-primary">Tentar novamente</button>
      </div>

      <div v-else class="profiles-grid">
        <div 
          v-for="profile in profiles" 
          :key="profile.id"
          class="profile-card"
          @click="selectProfile(profile)"
          :title="`Selecionar perfil ${profile.name}`"
        >
          <div class="profile-avatar">
            <div class="avatar-icon">
              {{ getInitials(profile.name) }}
            </div>
          </div>
          <h3 class="profile-name">{{ profile.name }}</h3>
        </div>

        <div 
          class="profile-card add-profile"
          @click="showCreateForm = true"
          title="Adicionar novo perfil"
        >
          <div class="profile-avatar">
            <div class="avatar-icon add-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <h3 class="profile-name">Adicionar Perfil</h3>
        </div>
      </div>

      <!-- Modal para criar novo perfil -->
      <div v-if="showCreateForm" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>Criar Novo Perfil</h2>
          <form @submit.prevent="createProfile">
            <div class="form-group">
              <label for="profileName" class="form-label">Nome do Perfil</label>
              <input 
                id="profileName"
                v-model="newProfileName" 
                type="text" 
                class="form-control"
                placeholder="Digite o nome do perfil"
                required
                maxlength="50"
              >
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="!newProfileName.trim()">
                Criar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ProfileService } from '../services/profileService'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'ProfileSelector',
  components: {
    LoadingSpinner
  },
  data() {
    return {
      profiles: [],
      loading: true,
      error: null,
      showCreateForm: false,
      newProfileName: ''
    }
  },
  async mounted() {
    await this.loadProfiles()
  },
  methods: {
    async loadProfiles() {
      try {
        this.loading = true
        this.error = null
        const response = await ProfileService.getProfiles()
        this.profiles = response.items || response || []
      } catch (error) {
        this.error = error.message
        console.error('Erro ao carregar perfis:', error)
      } finally {
        this.loading = false
      }
    },

    selectProfile(profile) {
      // Redireciona para a tela de resumo com o perfil filtrado
      this.$router.push({
        name: 'PaymentsSummary',
        query: { profileId: profile.id }
      })
    },

    getInitials(name) {
      if (!name || typeof name !== 'string') {
        return 'XX'
      }
      
      const cleanName = name.trim()
      if (cleanName.length === 0) {
        return 'XX'
      }
      
      const words = cleanName.split(' ').filter(word => word.length > 0)
      
      if (words.length >= 2) {
        // Se duas ou mais palavras, pega a primeira letra de cada uma
        return words
          .slice(0, 2)
          .map(word => word.charAt(0).toUpperCase())
          .join('')
      } else {
        // Se apenas uma palavra, pega as duas primeiras letras
        const singleWord = words[0]
        if (singleWord.length >= 2) {
          return singleWord.slice(0, 2).toUpperCase()
        } else {
          // Se a palavra tem apenas uma letra, repete ela
          return (singleWord.charAt(0) + singleWord.charAt(0)).toUpperCase()
        }
      }
    },

    async createProfile() {
      if (!this.newProfileName.trim()) return

      try {
        const newProfile = await ProfileService.createProfile({
          name: this.newProfileName.trim()
        })
        
        this.profiles.push(newProfile)
        this.closeModal()
        
        // Opcionalmente, selecionar automaticamente o novo perfil
        this.selectProfile(newProfile)
      } catch (error) {
        this.error = error.message
        console.error('Erro ao criar perfil:', error)
      }
    },

    closeModal() {
      this.showCreateForm = false
      this.newProfileName = ''
    }
  }
}
</script>

<style scoped>
.profile-selector {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.profile-container {
  width: 100%;
  max-width: 1000px;
  text-align: center;
}

.profile-title {
  color: white;
  font-size: 3rem;
  font-weight: 400;
  margin-bottom: 3rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .profile-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
}

.loading-state,
.error-state {
  color: white;
  padding: 2rem;
}

.error-message {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 200px));
  gap: 2rem;
  justify-content: center;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .profiles-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 150px));
    gap: 1.5rem;
  }
}

.profile-card {
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  padding: 1rem;
}

.profile-card:hover {
  transform: scale(1.1);
}

.profile-card:hover .avatar-icon {
  border-color: #fff;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}

.profile-avatar {
  margin-bottom: 1rem;
}

.avatar-icon {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 2rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .avatar-icon {
    width: 100px;
    height: 100px;
    font-size: 1.5rem;
  }
}

.add-profile .avatar-icon {
  background: rgba(255, 255, 255, 0.2);
  border: 3px dashed rgba(255, 255, 255, 0.5);
}

.add-icon svg {
  width: 2rem;
  height: 2rem;
  color: white;
}

.add-profile:hover .avatar-icon {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  border-style: solid;
}

.profile-name {
  color: white;
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .profile-name {
    font-size: 1rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.modal-content h2 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
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
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Variações de cores para os avatares */
.profile-card:nth-child(1) .avatar-icon {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.profile-card:nth-child(2) .avatar-icon {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.profile-card:nth-child(3) .avatar-icon {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
}

.profile-card:nth-child(4) .avatar-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.profile-card:nth-child(5) .avatar-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.profile-card:nth-child(6) .avatar-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.profile-card:nth-child(7) .avatar-icon {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.profile-card:nth-child(8) .avatar-icon {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
}
</style>