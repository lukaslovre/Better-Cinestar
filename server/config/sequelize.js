const path = require("path");
const fs = require("node:fs");
const { Sequelize } = require("sequelize");
const { configuration } = require("./environment");

const defaultStoragePath = path.join(__dirname, "../Database.sqlite");
const storagePath =
  (typeof configuration.SQLITE_STORAGE === "string" && configuration.SQLITE_STORAGE.trim()) ||
  (typeof process.env.SQLITE_STORAGE === "string" && process.env.SQLITE_STORAGE.trim()) ||
  defaultStoragePath;

try {
  fs.mkdirSync(path.dirname(storagePath), { recursive: true });

  // Provide a clear error if the directory isn't writable by the current user.
  // This is a common cause when running as non-root with a volume owned by root.
  fs.accessSync(path.dirname(storagePath), fs.constants.W_OK);

  if (fs.existsSync(storagePath) && fs.statSync(storagePath).isDirectory()) {
    throw new Error(
      `SQLITE_STORAGE points to a directory: ${storagePath}. ` +
        `This often happens if Docker bind-mounted a missing file path. ` +
        `Mount a directory and point SQLITE_STORAGE to a file inside it (e.g. /app/data/Database.sqlite).`,
    );
  }
} catch (error) {
  // Let Sequelize init fail with a clearer message.
  console.error("SQLite storage path setup failed:", error);
}

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: configuration.SEQUELIZE_LOGGING,
});

module.exports = {
  sequelize,
};
