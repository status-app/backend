import "reflect-metadata";

import { load as loadConfig } from "./config";
loadConfig();

import { Server } from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { generate } from "short-uuid";

import { AppDataSource } from "./data-source";
import { NotFoundError, defaultError } from "./errors";
import { API } from "./typings/api";
import { createLogger } from "./logger";
import routes from "./routes";

const PORT = process.env.PORT || 3000;
const LOGGER = createLogger();

LOGGER.debug("Initializing data source");

AppDataSource.initialize()
  .then(async (_con) => {
    LOGGER.debug("Data source initialized, starting");

    const app = express();

    // TODO make that a separate file?
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const id = generate();
      const start = Date.now();
      LOGGER.info(`${id}> ${req.method} ${req.path} for [${req.ip}]`);
      res.on("finish", () => {
        LOGGER.info(`${id}> Completed in ${Date.now() - start}ms`)
      });
      next();
    });

    // External middlewares
    app.use(cors())
      .use(helmet())
      .use(bodyParser.json());

    // Main routes
    app.use("/", routes);

    // 404 catchall
    app.use((_req: express.Request, _res: express.Response) => { throw new NotFoundError() });

    // Error handler
    app.use((
      err: Error | API.Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (!(err instanceof API.Error)) {
        LOGGER.error("An unknown error occurred", err);
        err = defaultError; // use default error message
      } else {
        LOGGER.debug("An API error has occurred:", err);
      }

      return res.status((err as API.Error).code).json({ error: err.message });
    });

    const httpServer: Server = app.listen(PORT, () =>
      LOGGER.info(`Live on http://localhost:${(httpServer.address() as any).port}`)
    );
  })
  .catch((error) => LOGGER.error(error));
