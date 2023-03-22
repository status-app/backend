import "reflect-metadata";
import "./config";

import { Server } from "http";
import express, { NextFunction, Request, Response } from "express";
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
    app.use((req: Request, res: Response, next: NextFunction) => {
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
    app.use((_req: Request, _res: Response) => {
      throw new NotFoundError()
    });

    // Error handler
    app.use((
      errorObj: Error | ErrorObject,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      let logger: Logger = LOGGER;
      let err: any = errorObj;
      if (err.controller) {
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
