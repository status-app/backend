import { config } from "dotenv";

export const load = () => { config(); };

const logLevel = process.env.DEBUG ? 4 : parseInt(process.env.LOG_LEVEL || "0", 10);

export default {
  jwtSecret: process.env.JWT_SECRET || "default",
  debugLevel: logLevel,
  debugEnabled: logLevel >= 1,
};
