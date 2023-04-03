/**
 * Adapts a string literal to an enum with uppercase keys and number values.
 * The values are the index of the key in the string literal.
 */
export type Adapter<T extends string> = { [key in T as Uppercase<T>]: number };

/**
 * Generates an adapter from a string array.
 * @param arr 
 * @returns 
 */
export function generateAdapter<T extends string>(arr: readonly T[]): Adapter<T> {
  return arr.reduce(
    (curr, val) => ({ ...curr, [val.toUpperCase()]: arr.indexOf(val) }),
    {},
  ) as Adapter<T>;
}
