import "reflect-metadata";

import { Server } from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";

import { load as loadConfig } from "./config";
import { AppDataSource } from "./data-source";
import routes from "./routes";
import { NotFoundError } from "./errors/NotFoundError";
import { API } from "./typings/api";
import { ApiError } from "./errors/ApiError";

loadConfig();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async (_con) => {
    const app = express();

    // Error handler
    app.use((
      err: Error | API.Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error((err as any).stack || err);

      if (!(err instanceof API.Error)) {
        console.log("the above error was not issued by the api!");
        err = new ApiError(); // use default error message
      }

      return res.status((err as API.Error).code).json({ error: err.message });
    });

    // External middlewares
    app.use(cors())
      .use(helmet())
      .use(bodyParser.json());

    // Main routes
    app.use("/", routes);

    // 404 catchall
    app.use((_req, _res) => { throw new NotFoundError() });

    const httpServer: Server = app.listen(PORT, () =>
      console.log(`Live on http://localhost:${(httpServer.address() as any).port}`)
    );
  })
  .catch(error => console.log(error));
