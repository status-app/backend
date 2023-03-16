import { DataSource, Repository } from "typeorm";
import User from "./entities/User";

// TODO .env

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "run/db.sqlite",
  synchronize: true,
  logging: !!process.env.DEBUG,
  entities: [ "src/entities/**/*.ts" ],
  subscribers: [ "src/subscribers/**/*.ts" ],
  migrations: [ "src/migrations/**/*.ts" ],
});

/**
 * @returns the user repository.
 */
export const userRepo = (): Repository<User> =>
  AppDataSource.getRepository(User);
