<template>
  <div id="app">
    <!-- Cabeçalho -->
    <el-header class="header">
      <el-row gutter="20" type="flex" justify="start" align="middle">
        <!-- Botão Hamburger -->
        <el-col :span="2">
          <el-button
            type="text"
            icon="el-icon-menu"
            @click="toggleDrawer"
            class="hamburger-btn"
          ></el-button>
        </el-col>

        <!-- Menu de Links -->
        <el-col :span="16">
          <el-menu :default-active="activeLink" mode="horizontal" @select="handleSelect"   background-color="#f5f5f5"          >
            <el-menu-item index="1">
              <router-link to="/" class="nav-link">Perguntas</router-link>
            </el-menu-item>
            <el-menu-item index="2">
              <router-link to="/relatorio" class="nav-link">Relatório</router-link>
            </el-menu-item>
          </el-menu>
        </el-col>
      </el-row>
    </el-header>

    <!-- Card Lateral (Drawer) -->
    <el-drawer
      title="Contas"
      :visible.sync="drawerVisible"
      direction="ltr"
      size="300px"

    >
    <div class="contas">
      <el-button type="primary" @click="adicionarContaMercadoLivre" style="margin-bottom: 20px;">
        Adicionar Conta do Mercado Livre
      </el-button>
      <ul>
        <li v-for="usuario in usuarios" :key="usuario.id">
          {{ usuario.first_name }}
          <el-button type="danger" @click="desvincularConta(usuario.id)" style="margin-bottom: 10px;" icon="el-icon-delete" circle>
          </el-button>
        </li>
      </ul>
    </div>
    </el-drawer>

    <!-- Espaçamento de Conteúdo -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuarios: [], // Lista de usuários
      drawerVisible: false, // Controle da visibilidade do card lateral
      activeLink: '1', // Define o link ativo inicial
    };
  },
  async mounted() {
    this.code = this.$route.query.code;
    this.usuarios = JSON.parse(localStorage.getItem("users")) || [];
    localStorage.setItem("users", JSON.stringify(this.usuarios));
  },
  methods: {
    handleSelect(index) {
      this.activeLink = index; // Atualiza o link ativo quando um item for selecionado
    },
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible; // Alterna a visibilidade do drawer
    },
    adicionarContaMercadoLivre() {
      const CLIENT_ID = "351292420134820";
      const REDIRECT_URI = process.env.VUE_APP_FRONT_LINK;
      const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
      window.location.href = authUrl;
    },
    desvincularConta(userId) {
      // Filtra os usuários, removendo o usuário com o userId correspondente
      this.usuarios = this.usuarios.filter(user => user.user_id !== userId);
      // Atualiza o localStorage
      localStorage.setItem("users", JSON.stringify(this.usuarios));
      // Se o usuário desvinculado for o que está selecionado, limpe a seleção
      if (this.selectedUser === userId) {
        this.selectedUser = null;
      }
      window.location.reload()
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

.header {
  background-color: #f5f5f5; /* Fundo cinza claro */
  padding: 20px; /* Ajuste do padding para dar espaçamento no cabeçalho */
}
.menu{
  background-color: #f5f5f5;
}
.nav-link {
  display: block;
  color: inherit;
  text-decoration: none;
  padding: 10px;
  cursor: pointer;
  width: 100%;
}

/* Estilos para o conteúdo abaixo do cabeçalho */
.content {
  padding: 20px;
  margin-top: 20px; /* Espaçamento entre o cabeçalho e o conteúdo */
}
.contas{
  padding: 25px;
}
</style>
