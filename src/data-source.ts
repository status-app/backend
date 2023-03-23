import { DataSource, Repository } from "typeorm";

import config from "./config";
import Service from "./entities/Service";
import User from "./entities/User";

// TODO .env

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "run/db.sqlite",
  synchronize: true,
  logging: config.debugEnabled,
  entities: [ "src/entities/**/*.ts" ],
  subscribers: [ "src/subscribers/**/*.ts" ],
  migrations: [ "src/migrations/**/*.ts" ],
});

/**
 * @returns the user repository.
 */
export const userRepo = (): Repository<User> =>
  AppDataSource.getRepository(User);


export const serviceRepo = (): Repository<Service> =>
  AppDataSource.getRepository(Service);
