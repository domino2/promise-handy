interface PromiseWaiter {
  i: number;
  pw: Promise<any>;
}

type PromiseTrigger = () => Promise<any>;

/**
 * Function that will return an array of promises triggered with delay in dependence of the previously triggered promises.
 * The result each of them is same as the result of the promise that triggered it.
 *
 * @param limit - limit of concurrently running promises
 * @param promiseTriggers - array of promises builders
 * @returns Collection of promises wrappers
 */
export default function (
  limit: number,
  promiseTriggers: PromiseTrigger[]
): Promise<any>[] {
  if (limit < 1 || limit >= promiseTriggers.length) {
    throw new Error(
      "Limit must be greater than 0 and less than promiseTriggers.length, otherwise it doesn't make sense to use this function"
    );
  }

  const pending = 0;
  const triggered = 1;
  const finished = 2;

  const promiseStatusBoard = new Array(promiseTriggers.length).fill(pending);
  const promisesResolvers = new Array(promiseTriggers.length).fill({});
  const promises = new Array(promiseTriggers.length).fill({}).map(
    (_, i) =>
      new Promise((rs, rj) => {
        promisesResolvers[i] = { resolve: rs, reject: rj };
      })
  );

  let promiseWaiterHeadPointer = 0;

  const getPromiseWaiter = (): PromiseWaiter | undefined => {
    const pointer = promiseWaiterHeadPointer;
    if (promiseTriggers[pointer] === undefined) {
      return undefined;
    }

    const pw = promiseTriggers[pointer]().then((r) => {
      promiseStatusBoard[pointer] = finished;
      promisesResolvers[pointer].resolve(r);
    });
    promiseStatusBoard[pointer] = triggered;

    promiseWaiterHeadPointer += 1;
    return { pw, i: pointer };
  };

  let promiseWaiters: PromiseWaiter[] = [];

  const race = () => {
    const nextPromiseWaiters: PromiseWaiter[] = [];

    for (let i = 0; i < promiseWaiters.length; i += 1) {
      if (promiseStatusBoard[promiseWaiters[i].i] !== finished) {
        nextPromiseWaiters.push(promiseWaiters[i]);
      }
    }

    while (nextPromiseWaiters.length < limit) {
      const pw = getPromiseWaiter();
      if (pw) {
        nextPromiseWaiters.push(pw);
      } else {
        break;
      }
    }

    promiseWaiters = nextPromiseWaiters;
    if (promiseWaiters.length) {
      Promise.race(promiseWaiters.map((pw) => pw.pw)).then(race);
    }
  };

  race();

  return promises;
}
