<template>
  <div>
    <!-- Barra de Seleção -->
    <el-row gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <!-- Selecionar o usuário -->
        <el-select
          @change="buscaProdutos"
          v-model="user.user_id"
          placeholder="Selecione um Usuário"
          class="select-style"
        >
          <el-option
            v-for="user in usuarios"
            :key="user.user_id"
            :label="user.first_name"
            :value="user.user_id"
          />
        </el-select>
      </el-col>

      <el-col :span="12">
        <!-- Selecionar o produto -->
         <div v-loading="trazProduto">
        <el-select
          v-if="user.user_id"
          @change="buscaPedidos"
          v-model="produto.id"
          placeholder="Selecione um produto"
          class="select-style"
        >
          <el-option
            v-for="produto in produtos"
            :key="produto.id"
            :label="produto.title"
            :value="produto.id"
          />
        </el-select>
      </div>
      </el-col>
    </el-row>

    <div v-loading="loading">
      <!-- Exibir informações apenas se houver um produto selecionado -->
      <div v-if="produto && produto.id">
        <el-button v-if="faltaSku" @click="gerarSku">Gerar sku</el-button>
        <el-row :gutter="20">
          <!-- Coluna da Tabela de Visitas -->
          <el-col :span="12">
            <table v-if="visitsData.total_visits > 0" class="visits-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Total de Visitas</th>
                  <th>Detalhes das Visitas</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="result in visitsData.results"
                  v-show="result.total > 0"
                  :key="result.date"
                >
                  <td>{{ formatDate(result.date) }}</td>
                  <td>{{ result.total }}</td>
                  <td>
                    <div v-if="result.visits_detail.length">
                      <ul>
                        <li v-for="detail in result.visits_detail" :key="detail.company">
                          {{ detail.company }}: {{ detail.quantity }}
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </el-col>

          <!-- Coluna do Relatório de Visitas -->
          <el-col :span="12">
            <div v-if="visitsData.item_id">
              <h1>Relatório de Visitas</h1>
              <p><strong>Total de Visitas:</strong> {{ visitsData.total_visits }}</p>
              <p><strong>Data Inicial:</strong> {{ formatDate(visitsData.date_from) }}</p>
              <p><strong>Data Final:</strong> {{ formatDate(visitsData.date_to) }}</p>
            </div>
          </el-col>
        </el-row>

        <!-- Outras informações adicionais de faturamento e pedidos -->
        <el-row gutter="20" style="margin-top: 20px">
          <el-col span="12">
            <div v-if="relatorioGeral">
              <h1>Relatório Geral</h1>
              <p><strong>Vendas Brutas:</strong> {{ relatorioGeral.vendasBrutas }}</p>
              <p><strong>Visitas:</strong> {{ relatorioGeral.visitas }}</p>
              <p><strong>Quantidade de Vendas:</strong> {{ relatorioGeral.qtdVendas }}</p>
              <p><strong>Conversão:</strong> {{ relatorioGeral.conversao }}%</p>
              <p>
                <strong>Vendas com Publicidade:</strong>
                {{ relatorioGeral.vendasComPublicidade }}
              </p>
              <p>
                <strong>Vendas sem Publicidade:</strong>
                {{ relatorioGeral.vendasSemPublicidade }}
              </p>
              <p><strong>Impressões:</strong> {{ relatorioGeral.impressoes }}</p>
              <p><strong>Receita:</strong> {{ relatorioGeral.receita }}</p>
              <p>
                <strong>Unidades Vendidas:</strong> {{ relatorioGeral.unidadesVendidas }}
              </p>
            </div>
          </el-col>
          <el-col span="12">
            <div v-if="faturamentoData">
              <h1>Relatório de Faturamento</h1>
              <p>
                <strong>Total Faturamento:</strong> {{ faturamentoData.totalFaturamento }}
              </p>
              <p>
                <strong>Média de Faturamento:</strong>
                {{ faturamentoData.mediaFaturamento }}
              </p>
              <p><strong>Total de Taxas:</strong> {{ faturamentoData.totalTaxa }}</p>
              <p>
                <strong>Quantidade de Vendas:</strong>
                {{ faturamentoData.quantidadeVendas }}
              </p>
            </div>
          </el-col>
        </el-row>

        <!-- Tabela de pedidos -->
        <el-table
          v-if="faturamentoData"
          :data="orders"
          style="width: 100%; margin-top: 20px"
        >
          <el-table-column prop="id" label="Order ID" width="180"></el-table-column>
          <el-table-column label="Payments">
            <template v-slot="scope">
              <el-table :data="scope.row.payments" border>
                <el-table-column
                  prop="total_paid_amount"
                  label="Paid Amount"
                  width="100"
                ></el-table-column>
                <el-table-column
                  prop="payment_method_id"
                  label="Payment Method"
                  width="180"
                ></el-table-column>
                <el-table-column prop="status" label="Status" width="180">
                  <template v-slot="scope">
                    <div>{{ getPaymentDescriptionByStatus(scope.row.status) }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="date_created" label="Date Created" width="180">
                  <template v-slot="scope">{{
                    new Date(scope.row.date_created).toLocaleString()
                  }}</template>
                </el-table-column>
                <el-table-column
                  prop="date_last_modified"
                  label="Date Last Modified"
                  width="180"
                >
                  <template v-slot="scope">{{
                    new Date(scope.row.date_last_modified).toLocaleString()
                  }}</template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import MercadoLivreService from "@/services/mercadoLivreService";

export default {
  data() {
    return {
      trazProduto:false,
      faltaSku: false,
      produtos: [],
      usuarios: [],
      user: {},
      produto: null,
      orders: [],
      visitsData: [],
      faturamentoData: null,
      relatorioGeral: null,
      paymentStatuses: [
        { status: "approved", description: "Pagamento aprovado" },
        { status: "pending", description: "Pagamento pendente" },
        { status: "in_process", description: "Pagamento em processo" },
        { status: "rejected", description: "Pagamento rejeitado" },
        { status: "refunded", description: "Pagamento reembolsado" },
        {
          status: "partially_refunded",
          description: "Pagamento reembolsado parcialmente",
        },
        { status: "cancelled", description: "Pagamento cancelado" },
        { status: "expired", description: "Pagamento expirado" },
      ],
      loading: false,
    };
  },
  async mounted() {
    this.usuarios = JSON.parse(localStorage.getItem("users")) || [];
  },
  methods: {
    async buscaProdutos(value) {
      this.trazProduto=true
      this.$set(this, "produtos", []);
      this.$set(this, "produto", {});
      this.usuarios = JSON.parse(localStorage.getItem("users")) || [];

      this.user = this.usuarios.find((user) => user.user_id === value);
      if (this.user) {
        console.log(this.user);
        try {
          const produtos = [await MercadoLivreService.getProducts(this.user)];
          if (produtos && produtos.length) {
            this.$set(this, "produtos", produtos);
            this.trazProduto=false
          }
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
          this.$set(this, "produtos", []);
        }
      }
    },
    async buscaPedidos(produtoId) {
      try {
        this.produto = this.produtos.find((prod) => prod.id === produtoId);
        this.faltaSku=false
        if (this.produto.variations && Array.isArray(this.produto.variations)) {
          // Percorre cada variação
          for (let variation of this.produto.variations) {
            // Verifica se a variação tem o atributo attributes
            if (variation.attributes && Array.isArray(variation.attributes)) {
              // Verifica se algum dos atributos tem id igual a "SELLER_SKU"
              const skuSellerAttribute = variation.attributes.find(
                (attr) => attr.id === "SELLER_SKU"
              );
              if (skuSellerAttribute) {
                console.log("Encontrado SKU_SELLER:", skuSellerAttribute);
              }
              else{
                this.faltaSku = true
              }
            }
            else{
              this.faltaSku = true
            }
          }
        }
        this.loading = true;
        const pedidos = await MercadoLivreService.buscarPedidos(
          this.user.user_id,
          produtoId,
          this.user.access_token
        );
        const metricas = await MercadoLivreService.calculaMetricas(
          this.user.user_id,
          produtoId,
          this.user.access_token
        );
        const visitsData = await MercadoLivreService.visitas(this.user, produtoId);
        const relatorio = await MercadoLivreService.relatorio(
          this.user.user_id,
          produtoId,
          this.user.access_token
        );

        this.$set(this, "visitsData", visitsData || {});
        this.$set(this, "faturamentoData", metricas || {});
        this.$set(this, "relatorioGeral", relatorio || {});
        this.$set(this, "orders", pedidos.results || []);
        this.loading = false;
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        this.$set(this, "orders", []);
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(dateString).toLocaleDateString("pt-BR", options);
    },
    getPaymentDescriptionByStatus(status) {
      const paymentStatus = this.paymentStatuses.find(
        (payment) => payment.status === status
      );
      return paymentStatus ? paymentStatus.description : "";
    },
    gerarSku(){
      this.loading=true
      MercadoLivreService.updateSku(this.user, this.produto.id).then(resp=>{
        console.log(resp);
        this.faltaSku = false
      })
    }
  },
};
</script>

<style scoped>
.select-style {
  margin-bottom: 20px;
  width: 100%;
}
.visits-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.visits-table th,
.visits-table td {
  padding: 8px;
  text-align: left;
  border: 1px solid #ddd;
}
.visits-table th {
  background-color: #f9f9f9;
  font-weight: bold;
}
</style>
