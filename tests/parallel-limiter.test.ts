import MUT from '(SRC)/parallel-limiter';

describe('Test to confirm parallel limiter functionality', () => {
  it('Should to limit concurrently running promises', async () => {
    expect(() => MUT(0, [])).toThrow();

    expect(() =>
      MUT(2, [() => Promise.resolve(), () => Promise.resolve()])
    ).toThrow();

    const testArray = [0, 0, 0];
    const promiseTriggers = [
      () => {
        testArray[0] = 1;
        return Promise.resolve();
      },
      () => {
        testArray[1] = 2;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise(() => {});
      },
      () => {
        testArray[2] = 1;
        return Promise.resolve();
      }
    ];

    const promises = MUT(2, promiseTriggers);

    expect(promiseTriggers.length).toBe(promises.length);

    await Promise.all([promises[0], promises[2]]).then(() => {
      expect(testArray[0]).toBe(1);
      expect(testArray[1]).toBe(2);
      expect(testArray[2]).toBe(1);
    });

    const promiseCreated: number[] = [];
    const promiseResolvers: Function[] = [];
    const promiseFullfiled: number[] = [];
    const promiseTriggers2 = [
      () => {
        promiseCreated[0] = 1;
        const p = new Promise((resolve: Function) => {
          promiseResolvers[0] = resolve;
        });
        p.then(() => {
          promiseFullfiled[0] = 1;
        });
        return p;
      },
      () => {
        promiseCreated[1] = 1;
        const p = new Promise((resolve) => {
          promiseResolvers[1] = resolve;
        });
        p.then(() => {
          promiseFullfiled[1] = 1;
        });
        return p;
      },
      () => {
        promiseCreated[2] = 1;
        const p = new Promise((resolve) => {
          promiseResolvers[2] = resolve;
        });
        p.then(() => {
          promiseFullfiled[2] = 1;
        });
        return p;
      },
      () => {
        promiseCreated[3] = 1;
        const p = new Promise((resolve) => {
          promiseResolvers[3] = resolve;
        });
        p.then(() => {
          promiseFullfiled[3] = 1;
        });
        return p;
      }
    ];

    const promises2 = MUT(2, promiseTriggers2);

    expect(promiseCreated).toEqual([1, 1]);
    expect(promiseFullfiled).toEqual([]);

    promiseResolvers[1]();

    await promises2[1].then(() => {
      expect(promiseFullfiled).toEqual([undefined, 1]);
    });

    promiseResolvers[0]();

    await promises2[0].then(() => {
      expect(promiseCreated).toEqual([1, 1, 1]);
      expect(promiseFullfiled).toEqual([1, 1]);
    });

    promiseResolvers[2]();
    await promises2;

    promiseResolvers[3]();

    await Promise.all(promises2).then(() => {
      expect(promiseCreated).toEqual([1, 1, 1, 1]);
      expect(promiseFullfiled).toEqual([1, 1, 1, 1]);
    });
  });
});
