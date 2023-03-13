import { ApiError } from "./ApiError";

export class NotFoundError extends ApiError {
  constructor(what?: string) {
    super(404, what ? `${what}_not_found` : "not_found");
  }
}
