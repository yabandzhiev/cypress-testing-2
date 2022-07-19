const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
  env: {
    username: "artem.bardem16@gmail.com",
    password: "CypressTest1",
    apiUrl: "https://conduit.productionready.io/",
  },
});
