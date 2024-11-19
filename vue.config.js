const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    allowedHosts: 'all',
    // Habilitar HTTPS
    server: {
      type: 'https',
    },
    // Defina a porta e o host se necessário
    port: 8080,
    host: '0.0.0.0', // Use '0.0.0.0' para permitir acessos externos
  },
};


