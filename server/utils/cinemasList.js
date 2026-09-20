const cinemas = require("../../shared/cinemas.json");

function getCinemas() {
  return cinemas.map((cinema) => ({ ...cinema }));
}

module.exports = { getCinemas };
