require('tsconfig-paths').register({
  baseUrl: './dist',
  paths: {
    '@/*': ['./*'],
    '@config/*': ['./config/*'],
    '@auth/*': ['./auth/*'],
    '@shares/*': ['./shares/*'],
    '@common/*': ['./common/*'],
    '@database/*': ['./database/*']
  }
});
