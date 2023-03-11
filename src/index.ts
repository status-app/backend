import "reflect-metadata";

import { Server } from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";

import { load as loadConfig } from "./config";
import { AppDataSource } from "./data-source";
import routes from "./routes";

loadConfig();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async (_con) => {
    const app = express()
      .use(cors())
      .use(helmet())
      .use(bodyParser.json());

    app.use("/", routes);

    //Catchall
    app.use((req, res) => {
      res.status(404);
      if (req.accepts("json")) {
        return res.json({ error: "not_found" });
      }
      res.type("txt").send("Not Found");
    });

    const httpServer: Server = app.listen(PORT, () =>
      console.log(`Live on http://localhost:${(httpServer.address() as any).port}`)
    );
  })
  .catch(error => console.log(error));
