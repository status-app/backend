import type { Repository } from "typeorm";
import { DataSource } from "typeorm";

import { config } from "./config";
import { Service } from "./entity/Service";
import { User } from "./entity/User";

// TODO .env

const DATA_SOURCE = new DataSource({
  type: "sqlite",
  database: "run/db.sqlite",
  synchronize: true,
  logging: config.debugEnabled,
  entities: [ "src/entity/**/*.ts" ],
  subscribers: [ "src/subscriber/**/*.ts" ],
  migrations: [ "src/migration/**/*.ts" ],
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
