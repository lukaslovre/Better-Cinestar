const path = require("path");
const { Sequelize } = require("sequelize");
const { configuration } = require("./environment");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../Database.sqlite"),
  logging: configuration.SEQUELIZE_LOGGING,
});

module.exports = {
  sequelize,
};
