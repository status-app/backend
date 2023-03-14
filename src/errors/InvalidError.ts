import { ApiError } from "./ApiError";

export class InvalidError extends ApiError {
  constructor(readonly what: string) {
    super(400, `invalid_${what}`)
  }
}
