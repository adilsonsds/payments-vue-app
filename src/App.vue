<template>
  <div id="app">
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">Gerenciador de Pagamentos</h1>
      </div>
    </nav>
    <main :class="['main-content', { 'no-navbar': !showNavbar }]">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    showNavbar() {
      // Ocultar navbar na tela de seleção de perfil
      return this.$route.name !== 'Home'
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-title {
  margin: 0;
  font-size: 1.5rem;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.main-content.no-navbar {
  margin: 0;
  padding: 0;
  max-width: none;
}
</style>