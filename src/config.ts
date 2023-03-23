import { config } from "dotenv";
import minimist from "minimist";
import path from "path";

let argv = null;
!argv && (() => {
  argv = minimist(process.argv.slice(2));
  config({ path: path.resolve(process.cwd(), argv["e"] || ".env") });
})();

const logLevel = process.env.DEBUG ? 4 : parseInt(process.env.LOG_LEVEL || "1", 10);

export default {
  jwtSecret: process.env.JWT_SECRET || "default",
  debugLevel: logLevel,
  debugEnabled: logLevel > 1,
};
