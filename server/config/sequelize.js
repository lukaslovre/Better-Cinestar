const path = require("path");
const { Sequelize } = require("sequelize");
const { configuration } = require("./environment");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../../", "Database.sqlite"), // This is supposed to be in the root of the project.
  logging: configuration.SEQUELIZE_LOGGING,
});

module.exports = {
  sequelize,
};
