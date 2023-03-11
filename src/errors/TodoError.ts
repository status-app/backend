import { ApiError } from "./ApiError";

export class TodoError extends ApiError {
  constructor(readonly todo?: string) {
    super(500, todo || "todo");
  }
}
