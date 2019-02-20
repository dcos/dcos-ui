import { Maybe, Just, Nothing } from "../Maybe";

describe("Maybe", () => {
  describe("#andThen", () => {
    it("chains", () => {
      expect(Maybe.andThen((v: number) => Just(v))(Just(1))).toEqual(Just(1));
    });

    it("short-circuits", () => {
      const fn = jest.fn(x => x);

      expect(Maybe.andThen(fn)(Nothing)).toEqual(Nothing);
      expect(fn.mock.calls.length).toBe(0);
    });
  });

  describe("#fromValue", () => {
    it("turns `A | undefined` into Maybe<A>", () => {
      const test = [1, 2].find(Number.isInteger);

      expect(Maybe.fromValue(test)).toEqual(Just(1));
    });

    it("does not map Nothing", () => {
      expect(Maybe.map(Number.isInteger)(Nothing)).toEqual(Nothing);
    });
  });

  describe("#map", () => {
    it("maps", () => {
      expect(Maybe.map((x: number) => x + 1)(Just(1))).toEqual(Just(2));

      // If you're mapping to the same type, you can use this to save some
      // optical noise.
      expect(Maybe.map<number>(x => x + 1)(Just(1))).toEqual(Just(2));
    });

    it("does not map Nothing", () => {
      expect(Maybe.map(Number.isInteger)(Nothing)).toEqual(Nothing);
    });
  });

  describe("#withDefault", () => {
    it("provides a default value for Nothing", () => {
      expect(Maybe.withDefault(42)(Nothing)).toBe(42);
    });

    it("unwraps the value in Just", () => {
      expect(Maybe.withDefault(42)(Just(1))).toBe(1);
    });
  });

  describe("#fold", () => {
    it("folds", () => {
      expect(
        Maybe.fold({
          Just: (x: number) => x + 1,
          Nothing: 42
        })(Just(1))
      ).toBe(2);

      expect(
        Maybe.fold({
          Just: (x: number) => x + 1,
          Nothing: 42
        })(Nothing)
      ).toBe(42);
    });
  });
});
