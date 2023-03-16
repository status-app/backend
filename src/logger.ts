import { bold, cyan, gray, green, magenta, red, yellow } from "chalk";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { inspect } from "util";

import config from "./config";

const METHOD_COLORS = {
  debug: gray,
  info: cyan,
  warn: yellow,
  pureError: red,
};

type LevelNames = keyof typeof METHOD_COLORS | "error";

export interface Logger extends Record<LevelNames, typeof console.log> {
  child(...names: string[]): Logger;
  error(err: Error): void;
  error(msg: string, err: Error | unknown): void;
}

let prod = false;
export function setProdMode(production: boolean) {
  prod = production;
}

/* TODO: Use type-di and/or implement a mechanism to store loggers and prevent duplicate instances.
         Debug log environment variable should allow scopes, to print logs for certain child loggers
         instead. */

function ensureLogsDirectory() {
  if (prod && !existsSync("logs/")) {
    mkdirSync("logs/");
  }
}

// These overloads are so that the child creation function isn't usually visible.
export function createLogger(name?: string): Logger;
export function createLogger(
  name: string,
  opts: { childNames?: string[]; debugEnabled?: boolean }
): Logger;
export function createLogger(
  name = "",
  opts?: { childNames?: string[]; debugEnabled?: boolean }
) {
  const knownChildNames = opts?.childNames ?? [];
  const debugEnabled = opts?.debugEnabled ?? config.debugEnabled;

  // If a logger has a blank name and has children, take the first child name as the main name.
  let effectiveName = name;
  if (name === "" && knownChildNames.length) {
    effectiveName = knownChildNames.pop() ?? "";
  }

  const displayName = [effectiveName, ...knownChildNames]
    .filter((name) => name !== "")
    .map((name) => green(name))
    .join(gray(" > "));

  ensureLogsDirectory();

  const bindToWriteLog = (s: string) => writeLog.bind(null, displayName, s);

  const loggerObject = {
    debug: (...args: unknown[]) => debugEnabled && writeLog(displayName, "debug", ...args),
    info: bindToWriteLog("info"),
    warn: bindToWriteLog("warn"),
    error: (msg: string, err: unknown = null) => {
      if (err === null) {
        // No second arg given, `msg` is the error.
        err = msg;
        msg = null;
      }

      msg && loggerObject.pureError(msg);
      if (typeof err === "undefined") {
        loggerObject.pureError(
          new Error(
            'Error object provided to error printer was "undefined". Using quasi-error for stacktrace instead'
          )
        );
      } else {
        loggerObject.pureError(err);
      }
    },
    pureError: bindToWriteLog("error"),
    child: (...childNames: string[]) =>
      createLogger(
        effectiveName,
        { debugEnabled, childNames: [...knownChildNames, ...childNames] }
      ),
  };

  return loggerObject;
}

function writeLog(displayName: string, key: LevelNames, ...args: unknown[]) {
  const callableKey = key === "warn" ? "info" : key;
  const colouriser = METHOD_COLORS[key === "error" ? "pureError" : key];

  const consoleArgs = [
    formatLog(displayName, { method: key, colorizer: colouriser }),
    ...args.map((arg) => typeof arg !== "object" ? arg : inspect(arg, { breakLength: Infinity })),
  ];

  console[callableKey as "log"](...consoleArgs);

  writeLogToFile(key, consoleArgs);
}

function writeLogToFile(key: string, consoleArgs: unknown[]) {
  // Only write to logs/ when it's a warning or an error
  if (prod && (key === "error" || key === "warn")) {
    ensureLogsDirectory();

    // We could also have a static file stream for both of the files, but since this technique is easier and has no
    // impact on performance, we'll keep doing that instead
    const stream = createWriteStream(
      `logs/${key}-${new Date()
        .toISOString()
        .split("T")[0]
        .replace(/\//g, "-")}.log`,
      {
        flags: "a", // Append it
        encoding: "utf-8",
      }
    );

    // Replace error objects by their stack and pretty-print object args
    const prettyArgs = consoleArgs
      .map((arg) => {
        if (arg instanceof Error) {
          return arg?.stack ?? `${arg}`;
        }

        return typeof arg === "object" ? inspect(arg) : arg;
      });

    stream.write(
      // Replace all ANSI styling codes.
      prettyArgs.join(" ").replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      ) + "\n"
    );

    // Avoid EMFILE errors by closing the stream when we're done using it.
    stream.end();
  }
}

function formatLog(
  displayName: string,
  opts: { method: string, colorizer: typeof gray },
) {
  // 11 is the length of the ANSI escape codes.
  let effectiveName = displayName;
  if (displayName.length > 11) {
    effectiveName += " ";
  }

  // Split it so that we only get the time without the date.
  const date = new Date();
  const time = `${date.toTimeString().split(" ")[0]}.${(`00${date.getMilliseconds()}`).slice(-3)}`;

  return `${bold(magenta(time))} ${effectiveName}${opts.colorizer(opts.method)}`;
}
