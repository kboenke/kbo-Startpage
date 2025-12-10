module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/jQuery/**',
    '!src/CryptoJS/**'
  ],
  coverageThreshold: {
    global: {
      functions: 50,
      lines: 30,
      statements: 30
    }
  }
};
