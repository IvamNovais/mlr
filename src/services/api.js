import axios from 'axios';

// Token de autenticação

// Configuração padrão do Axios
const instance = axios.create({
  baseURL: 'https://respostamercadolivre-production.up.railway.app/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }
});

// Interceptor de requisição para garantir que o token esteja sempre atualizado


export default instance;
