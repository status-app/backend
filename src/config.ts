import { config as setupDotenv } from "dotenv";
import minimist from "minimist";
import path from "path";

let argv = null;
!argv && (() => {
  argv = minimist(process.argv.slice(2));
  setupDotenv({ path: path.resolve(process.cwd(), argv["e"] || ".env") });
})();

const logLevel = process.env.DEBUG ? 4 : parseInt(process.env.LOG_LEVEL || "1", 10);

export const config = {
  jwtSecret: process.env.JWT_SECRET || "default",
  logLevel,
  debugEnabled: logLevel > 1,
  staticFolderPath: path.join(__dirname, "..", "static"),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_SECRET,
};
