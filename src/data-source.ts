import "reflect-metadata";

import type { Repository } from "typeorm";
import { DataSource } from "typeorm";

import { config } from "./config";
import { Service } from "./entity/Service";
import { User } from "./entity/User";

// TODO .env

export const DATA_SOURCE = new DataSource({
  type: "better-sqlite3",
  database: "run/db.sqlite",
  synchronize: true,
  logging: config.debugEnabled,
  migrationsRun: true,
  entities: [ Service, User ],
  subscribers: [ "src/subscriber/**/*.{js,ts}" ],
  migrations: [ "src/migration/**/*.{js,ts}" ],
});

export const initializeDataSource = (): Promise<DataSource> =>
  DATA_SOURCE.initialize();

/**
 * @returns the user repository.
 */
export const userRepo = (): Repository<User> =>
  DATA_SOURCE.getRepository(User);

/**
 * @returns the service repository.
 */
export const serviceRepo = (): Repository<Service> =>
  DATA_SOURCE.getRepository(Service);
