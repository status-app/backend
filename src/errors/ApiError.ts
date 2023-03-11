import { API } from "../typings/api";

export class ApiError extends API.Error implements Error {
  readonly name: string;

  constructor(readonly code: number = 500, readonly message: string = "unknown") {
    super();
    this.name = (<any>this).constructor.name; // fixme lol
  }
}
