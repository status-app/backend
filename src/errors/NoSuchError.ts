import { ApiError } from "./ApiError";

export class NoSuchItemError extends ApiError {
  constructor(readonly what: string) {
    super(404, `no_such_${what}`);
  }
}
