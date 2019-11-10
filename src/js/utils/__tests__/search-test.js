import search, { tokenize } from "../search";

describe("search util", () => {
  describe("search", () => {
    const fooExtractor = thing => thing.foo;

    it("sorts by relevance, word distance from beginning of string", () => {
      const _return = search(
        "baz",
        [
          { id: 0, foo: "beta-baz" },
          { id: 1, foo: "community-baz" },
          { id: 2, foo: "baz" }
        ],
        fooExtractor
      );

      expect(_return.length).toEqual(3);
      expect(_return[0].obj.foo).toEqual("baz");
      expect(_return[1].obj.foo).toEqual("beta-baz");
      expect(_return[2].obj.foo).toEqual("community-baz");
    });

    it("sorts by relevance, combining relevance of multiple search tokens", () => {
      const _return = search(
        "foo baz",
        [
          { id: 0, foo: "footballs" },
          { id: 1, foo: "strange bazookas" },
          { id: 2, foo: "bar" },
          { id: 3, foo: "foo bar baz" }
        ],
        fooExtractor
      );

      expect(_return.length).toEqual(3);
      expect(_return[0].obj.foo).toEqual("foo bar baz");
      expect(_return[1].obj.foo).toEqual("footballs");
      expect(_return[2].obj.foo).toEqual("strange bazookas");
    });
  });

  describe("tokenize", () => {
    it("return a lowercase array", () => {
      expect(tokenize("Hello, World")).toEqual(["hello", "world"]);
    });

    it("does not break on dash", () => {
      expect(tokenize("Hello-World")).toEqual(["hello-world"]);
    });

    it("does not break on slash", () => {
      expect(tokenize("Hello/World")).toEqual(["hello/world"]);
    });

    describe("null input", () => {
      it("returns empty array", () => {
        expect(tokenize(null)).toEqual([]);
      });
    });

    it("splits on non-word characters, but not slashes", () => {
      expect(
        tokenize(
          "foo/bar\\.baz.quis,qux quux[quuz]corge grault,garply\twaldo\bfred"
        )
      ).toEqual([
        "foo/bar",
        "baz",
        "quis",
        "qux",
        "quux",
        "quuz",
        "corge",
        "grault",
        "garply",
        "waldo",
        "fred"
      ]);
    });

    it("returns converts input to string if not a string", () => {
      expect(tokenize(10)).toEqual(["10"]);
    });

    it("removes empty strings", () => {
      expect(tokenize("bar\\.baz")).toEqual(["bar", "baz"]);
    });
  });
});
