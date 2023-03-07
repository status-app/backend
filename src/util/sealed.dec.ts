// https://medium.com/coding-spark/how-to-create-a-final-class-with-typescript-b81856c81525

/**
 * Seals the class
 */
export function sealed(...classes: any[]) {
  return <T extends { new(...args: any[]): object }>(target: T) => {
    return class Sealed extends target {
      constructor(...args: any[]) {
        if (new.target !== Sealed && !classes.includes(new.target.constructor)) {
          throw new Error(`Cannot extend a final class "${target.name}"`);
        }
  
        super(...args);
      }
    };
  }
}
