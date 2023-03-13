import { ApiError } from "./ApiError";

export class AlreadyLoggedInError extends ApiError {
  constructor() {
    super(500, "already_logged_in");
  }
}
