import "reflect-metadata";
import "./config";

import { Server } from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { generate } from "short-uuid";

import { AppDataSource } from "./data-source";
import { NotFoundError, defaultError } from "./errors";
import { API } from "./typings/api";
import { createLogger, Logger } from "./logger";
import routes from "./routes";

const PORT = process.env.PORT || 3000;
const LOGGER = createLogger();

LOGGER.debug("Initializing data source");

type ErrorObject = { err: API.Error, controller: { LOGGER: Logger } };

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
    app.use((_req: express.Request, _res: express.Response) => {
      throw new NotFoundError()
    });

    // Error handler
    app.use((
      errorObj: Error | ErrorObject,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      let logger: Logger = LOGGER;
      let err: any = errorObj;
      if (!(err instanceof Error)) {
        const obj = errorObj as ErrorObject;
        logger = obj.controller.LOGGER;
        err = obj.err;
      }

      if (err instanceof API.Error) {
        logger.debug("An API error occurred:", err);
      } else {
        logger.error("oh noes!", err);
        err = defaultError; // use default error message
      }

      return res.status((err as API.Error).code).json({ error: err.message });
    });

    const httpServer: Server = app.listen(PORT, () =>
      LOGGER.info(`Live on http://localhost:${(httpServer.address() as any).port}`)
    );
  })
  .catch((error) => LOGGER.error(error));
