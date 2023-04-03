import type { ValidationError } from "class-validator";
import { validate as validateClass } from "class-validator";

import { todo } from "./status";

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
  if (!t) return null;

  const errors: ValidationError[] = await validateClass(t);
  if (errors.length) {
    console.warn(errors); // TODO
    throw todo("...");
  }
  return t;
};
