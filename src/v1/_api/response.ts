// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Response {
}

export class Error implements Response {
  error: string;
}

export class Count implements Response {
  number: number;
}
