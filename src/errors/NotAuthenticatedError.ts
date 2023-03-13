import { ApiError } from "./ApiError";

export class NotAuthenticatedError extends ApiError {
  constructor(message?: string) {
    super(401, message || "auth");
  }
}
