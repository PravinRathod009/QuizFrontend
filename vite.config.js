server: {
  proxy: {
    '/api': {
      target: 'https://quizzy-backend-seven.vercel.app/',
      changeOrigin: true
    }
  }
}
