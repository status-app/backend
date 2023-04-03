import { isAsyncFunction } from "util/types";

export type MaybePromise<T> = Promise<T> | T;

/**
 * Only awaits the given function if it is async.
 *
 * @param fn the function to process.
 * @param args the args to give to the function.
 * @returns 
 */
export const awaitIfNeeded = async<T>(
  fn: (...args: unknown[]) => MaybePromise<T>,
  ...args: unknown[]
): Promise<T> => isAsyncFunction(fn) ? (await fn(...args)) : fn(...args);
