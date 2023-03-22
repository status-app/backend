import { API } from "./typings/api";

class ApiError extends API.Error implements Error {
  readonly name: string;

  constructor(readonly code: number = 500, readonly message: string = "unknown") {
    super();
    this.name = (this as any).constructor.name; // fixme lol
  }
}

export const defaultError = new ApiError();

export class AlreadyInUseError extends ApiError {
  constructor(readonly what: string) {
    super(409, `${what}_already_in_use`)
  }
}

export class AlreadyLoggedInError extends ApiError {
  constructor() {
    super(400, "already_logged_in");
  }
}

export class InternalError extends ApiError {
  constructor(message?: string) {
    super(500, message || "internal");
  }
}

export class InvalidError extends ApiError {
  constructor(readonly what: string) {
    super(400, `invalid_${what}`)
  }
}

export class MissingBodyError extends ApiError {
  constructor() {
    super(400, "missing_body")
  }
}

export class NoSuchError extends ApiError {
  constructor(readonly what: string) {
    super(404, `no_such_${what}`);
  }
}

export class NotAuthenticatedError extends ApiError {
  constructor(message?: string) {
    super(401, message || "auth");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message?: string) {
    super(403, message || "forbidden");
  }
}

export class NotModifiedError extends ApiError {
  constructor(message?: string) {
    super(304, message || "not_modified");
  }
}

export class NotFoundError extends ApiError {
  constructor(what?: string) {
    super(404, what ? `${what}_not_found` : "not_found");
  }
}

export class TodoError extends ApiError {
  constructor(readonly todo?: string) {
    super(500, todo || "todo");
    console.debug("TODO", new Error().stack); // TODO
  }
}
