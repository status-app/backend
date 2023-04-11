import type { NextFun, Request, Response } from "./types";
import { Controller } from "./Controller";
import { initializeDataSource } from "./data-source";
import { V1Controller } from "./v1/V1Controller";

import { generate as genShortUuid } from "short-uuid";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";

/**
 * The application singleton.
 */
export class App extends Controller<null> {
  private static _INSTANCE: App = null;

  readonly express: express.Application = express();

  readonly v1 = new V1Controller(this);

  private _host: string = process.env.HOST || "localhost";

  private _port: number = Number.parseInt(process.env.PORT, 10) || 3000;

  private constructor() {
    super(null);
    this.basePath = "";

    this.express.use(bodyParser.json());

    // Logger middleware. TODO: Move that?
    this.express.use((rq: Request, rs: Response, nxt: NextFun) => {
      const id = genShortUuid();
      const start = Date.now();
      this.logger.info(`${id}> ${rq.method} ${rq.path} for [${rq.ip}]`);
      rs.on("finish", () => {
        this.logger.info(`${id}> Completed in ${Date.now() - start}ms`);
      });
      nxt();
    });

    // External middlewares.
    this.express.use(
      cors({ credentials: true }),
      helmet(),
    );
  }

  static get INSTANCE() {
    return App._INSTANCE === null ? (App._INSTANCE = new App()) : this._INSTANCE;
  }

  get host(): string {
    return this._host;
  }

  get port(): number {
    return this._port;
  }

  publicUrl(path?: string): string {
    const host = this.host.includes(":") ? `[${this.host}]` : this.host;
    const port = this.port !== 80 ? `:${this.port}` : "";
    return `http://${host === "[::1]" ? "localhost" : host}${port}${this.url(path)}`;
  }

  async start(): Promise<void> {
    const epoch = Date.now();

    this.logger.info("Initializing data source...");
    await initializeDataSource();
    const epoch2 = Date.now();
    this.logger.debug("Initialized data source in " + (epoch2 - epoch) + "ms");

    this.logger.info("Registering controllers...");
    this.v1.register();
    this.logger.debug("Registered controllers in " + (Date.now() - epoch2) + "ms");

    this.express.use(this.router);

    this.logger.info("Starting Express...");
    return new Promise((res, _rej) => {
      const httpServer = this.express.listen(this.port, this.host, () => {
        const addr = httpServer.address() as { address: string, port: number };
        this._host = addr.address as string;
        this._port = addr.port as number;

        this.logger.info(
          `Live on ${this.publicUrl()} - Took ${Date.now() - epoch}ms`,
        );

        res();
      });
    });
  }
}
