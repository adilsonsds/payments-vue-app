import { createRouter, createWebHistory } from 'vue-router'
import ProfileSelector from '../components/ProfileSelector.vue'
import PaymentsSummary from '../components/PaymentsSummary.vue'
import PaymentsList from '../components/PaymentsList.vue'
import PaymentForm from '../components/PaymentForm.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ProfileSelector,
    meta: {
      title: 'Seleção de Perfil'
    }
  },
  {
    path: '/summary',
    name: 'PaymentsSummary',
    component: PaymentsSummary,
    meta: {
      title: 'Resumo de Pagamentos'
    }
  },
  {
    path: '/payments',
    name: 'PaymentsList',
    component: PaymentsList,
    meta: {
      title: 'Lista de Pagamentos'
    }
  },
  {
    path: '/create-payment',
    name: 'CreatePayment',
    component: PaymentForm,
    meta: {
      title: 'Criar Pagamento'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Atualiza o título da página
router.beforeEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} - Payments Management` : 'Payments Management'
})

export default router