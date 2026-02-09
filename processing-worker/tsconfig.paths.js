require('tsconfig-paths').register({
  baseUrl: './dist',
  paths: {
    '@/*': ['./*'],
    '@config/*': ['./config/*'],
    '@jobs/*': ['./jobs/*'],
    '@processors/*': ['./processors/*'],
    '@common/*': ['./common/*'],
    '@database/*': ['./database/*']
  }
});
