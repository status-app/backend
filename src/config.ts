import { config } from "dotenv";

export const load = () => { config(); };

export default {
  jwtSecret: process.env.JWT_SECRET || "default"
};
