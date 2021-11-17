import { filter, map, pipe, range, reduce, toAsync } from "../src/index";

const addNumber = (a: number, b: number) => a + b;
const addNumberAsync = async (a: number, b: number) => a + b;

describe("reduce", () => {
  describe("sync", () => {
    it("should return initial value when the given `iterable` is empty array", () => {
      expect(reduce((a, b) => a + b, "seed", [])).toEqual("seed");
    });

    it("should return 'undefined' when the given `iterable` is an empty array and initial value is absent", () => {
      expect(reduce((a, b) => a + b, [])).toBeUndefined();
    });

    it("should work given it is initial value", () => {
      expect(reduce(addNumber, 10, range(1, 6))).toEqual(25);
    });

    it("should use the first value as the initial value if initial value is absent", () => {
      expect(reduce(addNumber, range(1, 6))).toEqual(15);
    });

    it("should be able to be used as a curried function in the pipeline", () => {
      const res = pipe(
        ["1", "2", "3", "4", "5"],
        map((a) => Number(a)),
        filter((a) => a % 2),
        reduce(addNumber),
      );
      expect(res).toEqual(1 + 3 + 5);
    });
  });

  describe("async", () => {
    it("should reduce `iterable` by the callback", async () => {
      expect(await reduce(addNumber, 10, toAsync(range(1, 6)))).toEqual(25);
    });

    it("should use the first value as the initial value if initial value is absent", async () => {
      expect(await reduce(addNumber, toAsync(range(1, 6)))).toEqual(15);
    });

    it("should reduce `AsyncIterable` by the callback with initial value", async () => {
      expect(await reduce(addNumberAsync, 10, toAsync(range(1, 6)))).toEqual(
        25,
      );
    });

    it("should reduce 'AsyncIterable' by the callback", async () => {
      expect(await reduce(addNumberAsync, toAsync(range(1, 6)))).toEqual(15);
    });

    it("should return rejected 'Promise' if an error occurs in the callback", async () => {
      await expect(
        reduce(
          () => {
            throw new Error("err");
          },
          0,
          toAsync(range(1, 6)),
        ),
      ).rejects.toThrow("err");

      await expect(
        reduce(() => {
          throw new Error("err");
        }, toAsync(range(1, 6))),
      ).rejects.toThrow("err");

      await expect(
        pipe(
          toAsync(range(1, 6)),
          reduce(() => {
            throw new Error("err");
          }),
        ),
      ).rejects.toThrow("err");
    });

    it("should return rejected 'Promise' if an error occurs in the callback", async () => {
      await expect(
        reduce(() => Promise.reject(new Error("err")), 0, toAsync(range(1, 6))),
      ).rejects.toThrow("err");

      await expect(
        reduce(() => Promise.reject(new Error("err")), toAsync(range(1, 6))),
      ).rejects.toThrow("err");

      await expect(
        pipe(
          toAsync(range(1, 6)),
          reduce(() => Promise.reject(new Error("err"))),
        ),
      ).rejects.toThrow("err");
    });

    it("should be able to be used as a curried function in the pipeline", async () => {
      const res1 = await pipe(
        toAsync(["1", "2", "3", "4", "5"]),
        map((a) => Number(a)),
        filter((a) => a % 2),
        reduce(addNumber),
      );
      // async callback
      const res2 = await pipe(
        toAsync(["1", "2", "3", "4", "5"]),
        map((a) => Number(a)),
        filter((a) => a % 2),
        reduce(addNumberAsync),
      );
      expect(res1).toEqual(1 + 3 + 5);
      expect(res2).toEqual(1 + 3 + 5);
    });
  });
});