import "dotenv/config";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const dotEnv = {
  PORT: parseInt(process.env.PORT || "") || 3000,
  MONGO_URI: getRequiredEnv("MONGO_URI")
};