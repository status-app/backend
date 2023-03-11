import { ApiError } from "./ApiError";

export class InternalError extends ApiError {
  constructor(message?: string) {
    super(500, message || "internal");
  }
}
