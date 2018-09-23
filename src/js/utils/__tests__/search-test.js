import search, { tokenize } from "../search";

describe("search util", function() {
  describe("search", function() {
    const fooExtractor = thing => thing.foo;

    it("sorts by relevance, word distance from beginning of string", function() {
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

    it("sorts by relevance, combining relevance of multiple search tokens", function() {
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

  describe("tokenize", function() {
    it("return a lowercase array", function() {
      expect(tokenize("Hello, World")).toEqual(["hello", "world"]);
    });

    it("does not break on dash", function() {
      expect(tokenize("Hello-World")).toEqual(["hello-world"]);
    });

    it("does not break on slash", function() {
      expect(tokenize("Hello/World")).toEqual(["hello/world"]);
    });

    describe("null input", function() {
      it("returns empty array", function() {
        expect(tokenize(null)).toEqual([]);
      });
    });

    it("splits on non-word characters, but not slashes", function() {
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

    it("returns converts input to string if not a string", function() {
      expect(tokenize(10)).toEqual(["10"]);
    });

    it("removes empty strings", function() {
      expect(tokenize("bar\\.baz")).toEqual(["bar", "baz"]);
    });
  });
});
