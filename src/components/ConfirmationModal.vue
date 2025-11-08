<template>
  <div v-if="show" class="modal-overlay" @click="cancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="modal-actions">
        <button @click="cancel" class="btn btn-secondary">
          {{ cancelText }}
        </button>
        <button @click="confirm" class="btn" :class="confirmButtonClass">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmationModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmação'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    type: {
      type: String,
      default: 'primary', // primary, danger, warning
      validator: (value) => ['primary', 'danger', 'warning'].includes(value)
    }
  },
  computed: {
    confirmButtonClass() {
      return `btn-${this.type}`
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
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
  min-width: 400px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1rem 1.5rem;
}

.modal-body p {
  margin: 0;
  color: #495057;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

@media (max-width: 768px) {
  .modal-content {
    min-width: auto;
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>