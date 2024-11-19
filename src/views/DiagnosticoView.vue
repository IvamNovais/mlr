<template>
    <div class="diagnostico-anuncio">
      <h1>Diagnóstico de Anúncio do Mercado Livre</h1>
      <el-input 
        v-model="anuncioId" 
        placeholder="Digite o ID do anúncio" 
        style="width: 300px; margin-bottom: 20px;"
      />
      <el-button 
        type="primary" 
        @click="diagnosticoAnuncio" 
        :loading="loading" 
        style="margin-bottom: 20px;"
      >
        Realizar Diagnóstico
      </el-button>
  
      <el-card v-if="anuncioDetalhes" class="result-card">
        <h2>{{ anuncioDetalhes.title }}</h2>
        <p>Preço do anúncio: R$ {{ anuncioDetalhes.price }}</p>
        <p>Número total de visitas nos últimos 30 dias: {{ visitas }}</p>
  
        <h3>Ações sugeridas:</h3>
        <ul>
          <li v-if="visitas < 100">Ação: Considere melhorar o SEO do anúncio e criar campanhas para aumentar as visitas.</li>
          <li v-if="anuncioDetalhes.price < precoIdeal">Ação: Avalie a possibilidade de criar kits ou aumentar o preço do produto.</li>
          <li>Ação: Mantenha uma boa qualidade de fotos e avaliações positivas para aumentar a conversão.</li>
        </ul>
      </el-card>
  
      <el-message v-if="error" type="error" :show-close="true">
        {{ error }}
      </el-message>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        anuncioId: '',
        anuncioDetalhes: null,
        visitas: 0,
        loading: false,
        error: null,
        accessToken: 'APP_USR-351292420134820-110507-48c919077186a50affe957875e15cd51-2031072886',
        precoIdeal: 150,
      };
    },
    methods: {
      async obterDetalhesAnuncio(anuncioId) {
        try {
          const response = await axios.get(`https://api.mercadolibre.com/items/${anuncioId}`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          });
          return response.data;
        } catch (error) {
          console.error("Erro ao obter detalhes do anúncio:", error);
          this.error = "Erro ao obter detalhes do anúncio.";
          return null;
        }
      },
      async obterEstatisticasAnuncio(anuncioId) {
        try {
          const response = await axios.get(`https://api.mercadolibre.com/items/${anuncioId}/visits/time_window?last=30&unit=day`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          });
          return response.data.total_visits || 0;
        } catch (error) {
          console.error("Erro ao obter visitas do anúncio:", error);
          this.error = "Erro ao obter visitas do anúncio.";
          return 0;
        }
      },
      async diagnosticoAnuncio() {
        this.loading = true;
        this.error = null;
  
        // Obter detalhes do anúncio
        const anuncioDetalhes = await this.obterDetalhesAnuncio(this.anuncioId);
        if (!anuncioDetalhes) {
          this.loading = false;
          return;
        }
        this.anuncioDetalhes = anuncioDetalhes;
  
        // Obter visitas do anúncio
        this.visitas = await this.obterEstatisticasAnuncio(this.anuncioId);
  
        this.loading = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .result-card {
    margin-top: 20px;
  }
  </style>
  