import { ApiError } from "./ApiError";

export class InvalidError extends ApiError {
  constructor(readonly what: string) {
    super(401, `invalid_${what}`)
  }
}
