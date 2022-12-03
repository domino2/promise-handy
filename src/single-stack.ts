/**
 * A builder of promise wrapper function which acts based on lastly added
 * promise and forget those previously added.
 *
 * Example of usage:
 * ```
 * // it build the single stack function wrapper to stack promises
 * const lastPromiseReactor = makeSigleStack();
 *
 * // PromiseX is added to the stack and then function acts on it,
 * // once the lastPromiseReactor is called again with different promise,
 * // "then" function will act on the lastly added one
 * lastPromiseReactor(...PromiseX...).then(...);
 * ```
 *
 * @returns A single stack function wrapper.
 */
export default function (): Function {
  let storedPromises: Promise<any>[] = [];

  return async (promise) => {
    storedPromises.push(promise);

    const indexPromise = await Promise.resolve({
      index: storedPromises.length - 1,
      promise
    });

    return new Promise((resolve, reject) => {
      indexPromise.promise.then((result) => {
        if (indexPromise.index + 1 === storedPromises.length) {
          resolve(result);
          storedPromises = [];
        }
      }, reject);
    });
  };
}
