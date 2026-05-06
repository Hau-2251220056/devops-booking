const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const envPath = path.resolve(__dirname, "../../.env");

if (fs.existsSync(envPath)) {
  const fileEnv = dotenv.parse(fs.readFileSync(envPath));
  if (fileEnv.DATABASE_URL) {
    process.env.DATABASE_URL = fileEnv.DATABASE_URL;
  }
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

module.exports = prisma;
