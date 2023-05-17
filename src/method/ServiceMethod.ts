import type * as APIv1 from "../v1/api";

export abstract class ServiceMethod<T extends APIv1.Service.Method> {
  protected constructor(readonly type: T) {
  }

  async check(..._args: unknown[]): Promise<boolean> {
    return false;
  }
}
