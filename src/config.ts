import { config } from "dotenv";
let _loaded = false; !_loaded && (config() || true) && (_loaded = true);

const logLevel = process.env.DEBUG ? 4 : parseInt(process.env.LOG_LEVEL || "1", 10);

export default {
  jwtSecret: process.env.JWT_SECRET || "default",
  debugLevel: logLevel,
  debugEnabled: logLevel >= 1,
};
