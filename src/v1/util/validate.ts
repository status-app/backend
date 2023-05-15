import type { ValidationError } from "class-validator";
import { validate as validateClass } from "class-validator";

import { badRequest, todo } from "./status";

/**
 * Validates the given object.
 *
 * @param t the object to validate.
 * @returns the given {@link t}.
 * @throws a {@link todo} error if the object could not be validated.
 */
export const validate = async <T extends object>(
  t: T,
): Promise<T> => {
  if (!t) throw todo("handle_null_or_empty_body");

  const errors: ValidationError[] = await validateClass(t);
  if (errors.length) {
    console.warn(errors); // TODO
    throw badRequest("todo");
  }
  return t;
};
