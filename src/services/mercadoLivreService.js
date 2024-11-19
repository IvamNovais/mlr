// Importando a instância configurada do Axios
import api from './api'; // Caminho do arquivo onde a configuração do Axios foi definida

// Serviço para interação com o MercadoLivreController
const MercadoLivreService = {
  // Método para obter o token com o código de autorização e salvar múltiplos usuários
  async obterToken(code) {
    try {
      const response = await api.post(`/token/${code}`);
      const newUser = response.data;

      // Recupera a lista de usuários existente no localStorage, ou cria uma nova lista se estiver vazia
      const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

      // Verifica se o usuário já existe na lista para evitar duplicação
      const userExists = existingUsers.some(user => user.user_id === newUser.user_id);
      if (!userExists) {
        existingUsers.push(newUser); // Adiciona o novo usuário à lista
      }

      // Salva a lista atualizada no localStorage
      localStorage.setItem("users", JSON.stringify(existingUsers));

      return newUser;
    } catch (error) {
      console.error("Erro ao obter o token:", error);
      throw error;
    }
  },

  // Método para buscar perguntas do vendedor
  async getQuestions(user) {
    try {
      const response = await api.get(`/mercadolivre/questions/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perguntas:", error);
      throw error;
    }
  },
  async getQuestionsByAsker(user,asker) {
    try {
      const response = await api.get(`/mercadolivre/questions/${user.user_id}/${asker}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perguntas:", error);
      throw error;
    }
  },

  // Método para buscar produtos do vendedor
  async getProducts(user) {
    try {
      const response = await api.get(`/mercadolivre/products/${user.user_id}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  },
  

  // Método para responder uma pergunta, agora recebendo o usuário
  async responderPergunta(user, perguntaId, resposta) {
    const url = `/responder-pergunta/${perguntaId}`;

    try {
      const response = await api.post(url, resposta, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      console.log('Resposta:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao responder a pergunta:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  // Método para buscar detalhes de um produto de um vendedor específico
  async buscarDetalhesProdutosPorVendedor(user, produto) {
    console.log(user);
    
    try {
      const response = await api.get(`/detalhes/${user.user_id}/${produto}`, {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });
      return response.data; // Retorna os dados da resposta
    } catch (error) {
      console.error('Erro ao buscar detalhes dos produtos:', error);
      throw error; // Repassa o erro para o componente chamar o tratamento de erro
    }
  },buscarOrdens(sellerId, token) {
    return api.get(`/ordens/${sellerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.data) // Sucesso: Retorna os dados da API
    .catch(error => {
      console.error('Erro ao buscar ordens:', error);
      throw error; // Propaga o erro para ser tratado pelo componente chamador
    });
  },
  async buscarPedidos(sellerId, itemId, accessToken) {
    const url = `buscar-pedidos/${sellerId}/${itemId}`;

    try {
        const response = await api.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error.response ? error.response.data : error.message);
        throw error; // Opcional: re-throw para tratamento em outro lugar
    }
},
async visitas(user, produto) {
  console.log(user);
  
  try {
    const response = await api.get(`/mercadolivre/products/visitas/${produto}`, {
      headers: {
        'Authorization': `Bearer ${user.access_token}`
      }
    });
    return response.data; // Retorna os dados da resposta
  } catch (error) {
    console.error('Erro ao buscar detalhes dos produtos:', error);
    throw error; // Repassa o erro para o componente chamar o tratamento de erro
  }
},
async calculaMetricas(sellerId, itemId, accessToken) {
  const url = `faturamento/${sellerId}/${itemId}`;

  try {
      const response = await api.get(url, {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      return response.data;
  } catch (error) {
      console.error('Erro ao buscar pedidos:', error.response ? error.response.data : error.message);
      throw error; // Opcional: re-throw para tratamento em outro lugar
  }
},
async relatorio(sellerId, itemId, accessToken) {
  const url = `relatorio/${sellerId}/${itemId}`;

  try {
      const response = await api.get(url, {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
          },
      });

      return response.data;
  } catch (error) {
      console.error('Erro ao buscar pedidos:', error.response ? error.response.data : error.message);
      throw error; // Opcional: re-throw para tratamento em outro lugar
  }
},
async getUserInfo(accessToken) {
  try {
    const response = await api.get('/user-info', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('User Info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
},
async updateSku(user,produto) {
  try {
    const response = await api.put(`/update-sku/${produto}`,
      {},
      {
      headers: {
        Authorization: `Bearer ${user.access_token}`
      }
    });
    return response.data; // Retorna os dados da resposta
  } catch (error) {
    console.error('Erro ao buscar detalhes dos produtos:', error);
    throw error; // Repassa o erro para o componente chamar o tratamento de erro
  }
}
};

export default MercadoLivreService;
