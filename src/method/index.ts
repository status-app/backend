import { ServiceMethod } from "./ServiceMethod";
import type * as APIv1 from "../v1/api";
import { HttpServiceMethod } from "./HttpServiceMethod";
import { PingServiceMethod } from "./PingServiceMethod";

type ServiceMethodType = APIv1.Service.Method;

const METHODS: { [k in ServiceMethodType]: ServiceMethod<k> } = {
  "http": HttpServiceMethod.INSTANCE,
  "ping": PingServiceMethod.INSTANCE,
  "dns": null,
};

const todo = class TodoServiceMethod extends ServiceMethod<null> {
  private constructor() {
    super(null);
  }
};

export const methodForType = <T extends ServiceMethodType>(
  t: T,
): ServiceMethod<T> | typeof todo => METHODS[t] || todo;
