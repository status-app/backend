import { DataSource, Repository } from "typeorm";
import { User } from "./entity/User";

// TODO .env

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "run/db.sqlite",
  synchronize: true,
  logging: true,
  entities: [ "src/entity/**/*.ts" ],
  subscribers: [ "src/subscriber/**/*.ts" ],
  migrations: [ "src/migration/**/*.ts" ],
});

export const userRepo = (): Repository<User> => AppDataSource.getRepository(User);
