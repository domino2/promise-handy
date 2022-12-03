import MUT from '(SRC)/single-stack';

describe('Test to confirm single stack functionality', () => {
  const singleStack = MUT();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Should to act on lastly added promise only', done => {
    const promise1 = new Promise((resolve) => {
      setTimeout(() => resolve(1), 100);
    });
    const promise2 = new Promise((resolve) => {
      setTimeout(() => resolve(2), 1500);
    });
    const promise3 = new Promise((resolve) => {
      setTimeout(() => resolve(3), 500);
    });
    const promise4 = new Promise((resolve) => {
      setTimeout(() => resolve(4), 1000);
    });

    setTimeout(() => {
      singleStack(promise1).then(() => {
        throw new Error("This bit shouldn't happen");
      });
    }, 0);

    setTimeout(() => {
      singleStack(promise2).then(() => {
        throw new Error("This bit shouldn't happen");
      });
    }, 50);

    setTimeout(() => {
      singleStack(promise3).then(() => {
        throw new Error("This bit shouldn't happen");
      });
    }, 100);

    setTimeout(() => {
      singleStack(promise4).then((r) => {
        expect(r).toBe(4);
      });
    }, 1100);

    Promise.all([promise1, promise2, promise3, promise4]).then(() => {
      done();
    });

    jest.advanceTimersByTime(1500);
  });
});
