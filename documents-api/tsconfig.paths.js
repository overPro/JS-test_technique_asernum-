require('tsconfig-paths').register({
  baseUrl: './dist',
  paths: {
    '@/*': ['./*'],
    '@config/*': ['./config/*'],
    '@auth/*': ['./auth/*'],
    '@documents/*': ['./documents/*'],
    '@folders/*': ['./folders/*'],
    '@uploads/*': ['./uploads/*'],
    '@common/*': ['./common/*'],
    '@database/*': ['./database/*'],
    '@shared/*': ['../shared/*']
  }
});
