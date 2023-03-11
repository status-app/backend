import { ApiError } from "./ApiError";

export class AlreadyInUseError extends ApiError {
  constructor(readonly what: string) {
    super(409, `${what}_already_in_use`)
  }
}
