import type { Logger } from "./logger";
import type { MethodString, RouterHandler } from "./types";
import { App } from "./App";
import { createLogger } from "./logger";
import { Router } from "./types";
import { uncapitalize } from "./util/string";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Controller<P extends Controller<any>> {
  protected readonly router: Router = Router();

  private _logger: Logger;

  private _loggerName?: string;

  /**
   * Defaults to '/xyzAbc' if the class name is XyzAbcController.
   */
  private _basePath = `/${uncapitalize(
    this.constructor.name.replace(/Controller$/, ""),
  )}`;

  constructor(protected readonly parent: P) {
  }

  get logger(): Logger {
    if (!this._logger) {
      let loggerName = this._loggerName ?? this.basePath.slice(1);
      let parent = this.parent;
      while (parent?._basePath) {
        loggerName = (parent.loggerName ?? parent.basePath.slice(1)) + "." + loggerName;
        parent = parent.parent;
      }
      this._logger = createLogger(loggerName);
    }

    return this._logger;
  }

  get basePath(): string {
    return this._basePath;
  }

  protected set basePath(value: string) {
    this._basePath = value;
  }

  protected set loggerName(value: string) {
    if (this._loggerName !== undefined) {
      throw new Error("readonly prop");
    }
    this._loggerName = value;
  }

  register(): void {
    this.logger.debug("Registering", this.url(), "(" + this.constructor.name + ")");
    (this.parent?.router ?? App.INSTANCE.router).use(
      this.basePath,
      this.router,
    );
  }

  url(path = ""): string {
    return this.parent?.url(`${this.basePath}${path}`) ?? `${this.basePath}${path}`;
  }

  protected get<T>(
    fun: RouterHandler<T>,
    path?: string,
    ...args: unknown[]
  ): void {
    this._("get", fun, path, ...args);
  }

  protected post<T>(
    fun: RouterHandler<T>,
    path?: string,
    ...args: unknown[]
  ): void {
    this._("post", fun, path, ...args);
  }

  protected patch<T>(fun: RouterHandler<T>, path?: string, ...args: unknown[]): void {
    this._("patch", fun, path, ...args);
  }

  private _<T>(
    type: MethodString,
    fun: RouterHandler<T>,
    path?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): void {
    let router = this.router;
    let realPath = path ?? "";
    this.logger.debug("Routing", type.toUpperCase(), this.url(realPath));
    if (realPath && !realPath.startsWith("/")) {
      router = this.parent.router;
      realPath = this.basePath + realPath;
      this.logger.debug("^(Used parent router)");
    }
    router[type](realPath, fun, ...args);
  }
}
