import { config } from "dotenv";
import minimist from "minimist";

let argv = null;
!argv && (() => {
  argv = minimist(process.argv.slice(2));
  // pnpm start -e xyz.env
  config({ path: argv["e"] || ".env" });
})();

const logLevel = process.env.DEBUG ? 4 : parseInt(process.env.LOG_LEVEL || "1", 10);

export default {
  jwtSecret: process.env.JWT_SECRET || "default",
  debugLevel: logLevel,
  debugEnabled: logLevel >= 1,
};
