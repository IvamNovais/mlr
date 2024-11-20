<template>
  <div>
    <!-- Seletor para escolher o usuário -->
    <el-select
      v-model="selectedUser"
      @change="salvaUser"
      placeholder="Selecione um Usuário"
      style="margin-bottom: 20px; margin-right: 10px; width: 500px;"
    >
      <el-option
        v-for="user in usuarios"
        :key="user.user_id"
        :label="user.first_name"
        :value="user.user_id"
      />
    </el-select>


    <!-- Tabela de Perguntas para o Usuário Selecionado -->
    <div v-if="selectedUser" style="margin-top: 40px;">
      <h3>Perguntas para {{ user.first_name }}</h3>
      <el-table :data="user.perguntas" border style="width: 100%">
        <el-table-column prop="text" label="Pergunta" />
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            {{ significados[row.status] }}
          </template>
        </el-table-column>
        <el-table-column label="Resposta">
          <template #default="{ row }">
            <span v-if="row.answer">{{ row.answer.text }}</span>
            <el-button v-else type="primary" @click="openResponseModal(row)">
              Responder
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Data da Pergunta" width="200">
          <template #default="{ row }">
            <span>{{ formatDate(row.date_created) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Data da Resposta" width="200">
          <template #default="{ row }">
            <span v-if="row.answer">{{ formatDate(row.answer.date_created) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ações" width="150">
          <template #default="{ row }">
            <el-button type="info" @click="viewProduct(user, row.item_id)">Ver Produto</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Diálogo para Responder Pergunta -->
    <el-dialog :visible.sync="isResponseModalVisible" width="90%" title="Responder Pergunta">
      <div>
        <el-table :data="perguntasMesmaPessoa" v-if="perguntasMesmaPessoa.length" style="width: 100%" :row-class-name="tableRowClassName">
          <el-table-column prop="text" label="Pergunta" />
          <el-table-column label="Status" width="120">
            <template #default="{ row }">
              {{ significados[row.status] }}
            </template>
          </el-table-column>
          <el-table-column label="Resposta">
            <template #default="{ row }">
              <span v-if="row.answer">{{ row.answer.text }}</span>
              <el-button v-else type="primary" @click="openResponseModal(row)">
                Responder
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="Data da Pergunta" width="200">
            <template #default="{ row }">
              <span>{{ formatDate(row.date_created) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Data da Resposta" width="200">
            <template #default="{ row }">
              <span v-if="row.answer">{{ formatDate(row.answer.date_created) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <p>Pergunta: {{ currentQuestion?.text }}</p>
        <el-input
          type="textarea"
          v-model="responseText"
          placeholder="Digite sua resposta aqui..."
          rows="4"
        ></el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isResponseModalVisible = false">Cancelar</el-button>
        <el-button type="primary" @click="submitResponse">Enviar Resposta</el-button>
      </span>
    </el-dialog>

    <!-- Diálogo para Detalhes do Produto -->
    <el-dialog :visible.sync="isProductModalVisible" title="Detalhes do Produto">
      <div v-if="productDetails">
        <p><strong>Nome:</strong> {{ productDetails.title }}</p>
        <p><strong>Descrição:</strong> {{ productDetails.description }}</p>
        <p><strong>Preço:</strong> R$ {{ productDetails.price.toFixed(2) }}</p>
        <img
          v-if="productDetails.pictures.length"
          :src="productDetails.pictures[0].url"
          alt="Imagem do Produto"
          style="max-width: 100%"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isProductModalVisible = false">Fechar</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MercadoLivreService from "@/services/mercadoLivreService";

export default {
  name: "HomeView",
  data() {
    return {
      code: "",
      user:{},
      perguntasMesmaPessoa:[],
      usuarios: [], // Lista de usuários
      selectedUser: null, // Usuário selecionado do select
      isResponseModalVisible: false,
      isProductModalVisible: false,
      currentQuestion: null,
      responseText: "",
      productDetails: null,
      significados: {
        UNANSWERED: "Não respondida",
        ANSWERED: "Respondida",
        CLOSED_UNANSWERED: "Encerrada não respondida",
        UNDER_REVIEW: "Em análise",
        ITEM_ID: "ID do produto",
        DATE_CREATED: "Data de criação",
        ANSWER: "Resposta do vendedor",
      },
    };
  },
  computed: {
    // Computed property para filtrar perguntas do usuário selecionado
    filteredQuestions() {
      const user = this.usuarios.find(u => u.user_id === this.selectedUser);
      return user ? user.perguntas : [];
    },
  },
  async mounted() {
    this.code = this.$route.query.code;
    this.usuarios = JSON.parse(localStorage.getItem("users")) || [];
    if (this.code) {
      const newUser = await MercadoLivreService.obterToken(this.code);
      const details = await MercadoLivreService.getUserInfo(newUser.access_token)
      const dados = Object.assign({}, newUser, details);
      if (this.usuarios.filter(user => user.user_id === dados.user_id).length===0){
      this.usuarios.push(dados);
      }
      else{
        this.$message({
        message: 'A conta ja existe',
        type: 'error',
      });
      }
      for (let user of this.usuarios) {
      const perguntas = await MercadoLivreService.getQuestions(user);
      this.$set(user, 'perguntas', perguntas.questions || []);
      }
      localStorage.setItem("users", JSON.stringify(this.usuarios));
      this.$router.push("/")
    } else{
    for (let user of this.usuarios) {
      const perguntas = await MercadoLivreService.getQuestions(user);
      this.$set(user, 'perguntas', perguntas.questions || []);
    }
    localStorage.setItem("users", JSON.stringify(this.usuarios));

  }
  },
  methods: {
    tableRowClassName({row}){
      if(row.id=== this.currentQuestion.id){
        return "success-row"
      }
    },
    async salvaUser(value){
      this.usuarios = JSON.parse(localStorage.getItem("users")) || [];
      this.user = this.usuarios.find((user) => user.user_id === value);
    },
    adicionarContaMercadoLivre() {
      const CLIENT_ID = "351292420134820";
      const REDIRECT_URI = process.env.VUE_APP_FRONT_LINK;
      const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
      window.location.href = authUrl;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    async openResponseModal(question) {
      this.perguntasMesmaPessoa = await MercadoLivreService.getQuestionsByAsker(this.user, question.from.id)
      this.currentQuestion = question;
      this.isResponseModalVisible = true;
    },
    submitResponse() {
      if (this.responseText.trim()) {
        this.currentQuestion.answer = {
          text: this.responseText,
          status: "ACTIVE",
          date_created: new Date().toISOString(),
        };
        // Passa o usuário ao responder pergunta
        MercadoLivreService.responderPergunta(this.user, this.currentQuestion.id, this.responseText).then(res => {
          console.log(res);
          this.isResponseModalVisible = false;
          this.responseText = ""; // Limpa o campo de resposta
          this.currentQuestion = null;
          this.$router.go(0);
        });
      }
    },
    async viewProduct(user, productId) {
      this.productDetails = await MercadoLivreService.buscarDetalhesProdutosPorVendedor(user, [productId]);
      this.isProductModalVisible = true;
    },
    desvincularConta(userId) {
      // Filtra os usuários, removendo o usuário com o userId correspondente
      this.usuarios = this.usuarios.filter(user => user.user_id !== userId);
      // Atualiza o localStorage
      localStorage.setItem("users", JSON.stringify(this.usuarios));
      console.log(`Conta com ID ${userId} desvinculada.`);
      // Se o usuário desvinculado for o que está selecionado, limpe a seleção
      if (this.selectedUser === userId) {
        this.selectedUser = null;
      }
    },
  },
};
</script>
<style>
.el-table .success-row {
  background: rgb(95, 200, 214);
}
</style>
