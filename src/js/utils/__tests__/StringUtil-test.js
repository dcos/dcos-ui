const StringUtil = require("../StringUtil");

describe("StringUtil", function() {
  describe("#arrayToJoinedString", function() {
    it("joins array with default separator", function() {
      var result = StringUtil.arrayToJoinedString([1, 2]);

      expect(result).toEqual("1, 2");
    });

    it("joins array with the given separator", function() {
      var result = StringUtil.arrayToJoinedString([1, 2], "-");

      expect(result).toEqual("1-2");
    });

    it("does not append separator if array has only one  element", function() {
      var result = StringUtil.arrayToJoinedString([1]);

      expect(result).toEqual("1");
    });

    it("returns empty string if array is null", function() {
      var result = StringUtil.arrayToJoinedString(null);

      expect(result).toEqual("");
    });

    it("returns empty string if array is undefined", function() {
      var result = StringUtil.arrayToJoinedString();

      expect(result).toEqual("");
    });

    it("returns empty string if array is and object", function() {
      var result = StringUtil.arrayToJoinedString({});

      expect(result).toEqual("");
    });

    it("returns empty string if array is empty", function() {
      var result = StringUtil.arrayToJoinedString([]);

      expect(result).toEqual("");
    });
  });

  describe("#getSearchTokens", function() {
    it("splits on non-word characters, but not slashes", function() {
      expect(
        StringUtil.getSearchTokens(
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
      expect(StringUtil.getSearchTokens(10)).toEqual(["10"]);
    });

    it("removes empty strings", function() {
      expect(StringUtil.getSearchTokens("bar\\.baz")).toEqual(["bar", "baz"]);
    });

    it("lowercases strings", function() {
      expect(StringUtil.getSearchTokens("QuUx[qUuz]coRge")).toEqual([
        "quux",
        "quuz",
        "corge"
      ]);
    });
  });

  describe("#filterByString", function() {
    it("filters using a key as getter", function() {
      var _return = StringUtil.filterByString(
        [{ id: 0, foo: "bar" }, { id: 1, foo: "baz" }, { id: 2, foo: "bar" }],
        "foo",
        "bar"
      );

      expect(_return).toEqual([{ id: 0, foo: "bar" }, { id: 2, foo: "bar" }]);
    });

    it("filters using a function as getter", function() {
      var _return = StringUtil.filterByString(
        [{ id: 0, foo: "bar" }, { id: 1, foo: "baz" }, { id: 2, foo: "bar" }],
        function(el) {
          return el.foo;
        },
        "baz"
      );
      expect(_return).toEqual([{ id: 1, foo: "baz" }]);
    });

    it("sorts by relevance, word distance from beginning of string", function() {
      const _return = StringUtil.filterByString(
        [
          { id: 0, foo: "beta-baz" },
          { id: 1, foo: "community-baz" },
          { id: 2, foo: "baz" }
        ],
        "foo",
        "baz"
      );

      expect(_return.length).toEqual(3);
      expect(_return[0].foo).toEqual("baz");
      expect(_return[1].foo).toEqual("beta-baz");
      expect(_return[2].foo).toEqual("community-baz");
    });

    it("sorts by relevance, combining relevance of multiple search tokens", function() {
      const _return = StringUtil.filterByString(
        [
          { id: 0, foo: "footballs" },
          { id: 1, foo: "strange bazookas" },
          { id: 2, foo: "bar" },
          { id: 3, foo: "foo bar baz" }
        ],
        "foo",
        "foo baz"
      );

      expect(_return.length).toEqual(3);
      expect(_return[0].foo).toEqual("foo bar baz");
      expect(_return[1].foo).toEqual("footballs");
      expect(_return[2].foo).toEqual("strange bazookas");
    });
  });

  describe("#escapeForRegExp", function() {
    it("escapes string", function() {
      var _return = StringUtil.escapeForRegExp("-[]/{}()*+?.\\^$|");
      var escaped = "\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|";
      expect(_return).toEqual(escaped);
    });
  });

  describe("#isUrl", function() {
    it("accepts a string starting with http://", function() {
      var str = "http://asd/";
      expect(StringUtil.isUrl(str)).toEqual(true);
    });

    it("accepts a string starting with https://", function() {
      var str = "https://.asf";
      expect(StringUtil.isUrl(str)).toEqual(true);
    });

    it("doesn't accept a string with something before http://", function() {
      var str = "ahttp://";
      expect(StringUtil.isUrl(str)).toEqual(false);
    });

    it("doesn't accept null", function() {
      var str = null;
      expect(StringUtil.isUrl(str)).toEqual(false);
    });

    it("doesn't accept a string missing a /", function() {
      var str = "http:/asfasfd";
      expect(StringUtil.isUrl(str)).toEqual(false);
    });

    it("doesn't accept a string missing :", function() {
      var str = "http//";
      expect(StringUtil.isUrl(str)).toEqual(false);
    });

    it("doesn't accept a string that only contains protocol", function() {
      var str = "http://";
      expect(StringUtil.isUrl(str)).toEqual(false);
    });

    it("doesn't accept a string that only contains protocol", function() {
      var str = "https://";
      expect(StringUtil.isUrl(str)).toEqual(false);
    });
  });

  describe("#isEmail", function() {
    it("accepts a string with @ and . longer than 3 chars", function() {
      var str = "@.as";
      expect(StringUtil.isEmail(str)).toEqual(true);
    });

    it("accepts a string with @ and . longer than 3 chars", function() {
      var str = "a@.a";
      expect(StringUtil.isEmail(str)).toEqual(true);
    });

    it("doesn't accept a string without a .", function() {
      var str = "a@aa";
      expect(StringUtil.isEmail(str)).toEqual(false);
    });

    it("doesn't accept null", function() {
      var str = null;
      expect(StringUtil.isEmail(str)).toEqual(false);
    });

    it("doesn't accept a string without a @", function() {
      var str = "aw.a";
      expect(StringUtil.isEmail(str)).toEqual(false);
    });

    it("doesn't accept a string shorter than 4", function() {
      var str = "@.a";
      expect(StringUtil.isEmail(str)).toEqual(false);
    });
  });

  describe("#pluralize", function() {
    it("pluralizes if there's more than one item", function() {
      expect(StringUtil.pluralize("item", 2)).toEqual("items");
    });

    it("pluralizes if there's no items", function() {
      expect(StringUtil.pluralize("item", 0)).toEqual("items");
    });

    it("doesn't pluralize if there's a single item", function() {
      expect(StringUtil.pluralize("item", 1)).toEqual("item");
    });

    it("correctly pluralizes if a word ends with a 'y'", function() {
      expect(StringUtil.pluralize("butterfly", 2)).toEqual("butterflies");
    });
  });

  describe("#punctuate", function() {
    it("punctuates a sentence without a period", function() {
      expect(StringUtil.punctuate("butterfly is nice")).toEqual(
        "butterfly is nice."
      );
    });

    it("punctuates a single word without a period", function() {
      expect(StringUtil.punctuate("butterfly")).toEqual("butterfly.");
    });

    it("punctuates a whitespace padded sentence without a period", function() {
      expect(StringUtil.punctuate("butterfly is nice ")).toEqual(
        "butterfly is nice."
      );
    });

    it("does not further punctuate a sentence with a period", function() {
      expect(StringUtil.punctuate("butterfly is nice.")).toEqual(
        "butterfly is nice."
      );
    });

    it("returns empty string when parameter type not a string", function() {
      expect(StringUtil.punctuate(1)).toEqual("");
    });

    it("punctuates empty string", function() {
      expect(StringUtil.punctuate("")).toEqual(".");
    });
  });

  describe("#capitalize", function() {
    it("capitalizes the string correctly", function() {
      expect(StringUtil.capitalize("kenny")).toEqual("Kenny");
    });

    it("returns null if input is not a string", function() {
      expect(StringUtil.capitalize(10)).toEqual(null);
    });

    it("does nothing if string is already capitalized", function() {
      var capitalizedString = "Name";
      expect(StringUtil.capitalize(capitalizedString)).toEqual(
        capitalizedString
      );
    });
  });

  describe("#lowercase", function() {
    it("formats the string with the correct case", function() {
      expect(StringUtil.lowercase("Every")).toEqual("every");
    });

    it("returns null if input is not a string", function() {
      expect(StringUtil.lowercase(10)).toEqual(null);
    });

    it("does nothing if string is already lowercase", function() {
      var lowercaseString = "every";
      expect(StringUtil.lowercase(lowercaseString)).toEqual(lowercaseString);
    });
  });

  describe("#humanizeArray", function() {
    it("returns an empty string for a 0-length array", function() {
      expect(StringUtil.humanizeArray([])).toEqual("");
    });

    it("returns the sole member of a 1-length array", function() {
      expect(StringUtil.humanizeArray(["one"])).toEqual("one");
    });

    it("joins a 2-length array with 'and'", function() {
      expect(StringUtil.humanizeArray(["one", "two"])).toEqual("one and two");
    });

    it("joins a 3-length array with commas and 'and'", function() {
      expect(StringUtil.humanizeArray(["one", "two", "three"])).toEqual(
        "one, two, and three"
      );
    });

    it("allows the user to disable the serial comma", function() {
      expect(
        StringUtil.humanizeArray(["one", "two", "three"], {
          serialComma: false
        })
      ).toEqual("one, two and three");
    });
  });

  describe("#parseMarkdown", function() {
    it("adds _blank target to plain links in text", function() {
      expect(
        StringUtil.parseMarkdown("Hello this is a link http://somelink.com")
          .__html
      ).toEqual(
        `<p>Hello this is a link <a target="_blank" href="http://somelink.com">http://somelink.com</a></p>\n`
      );
    });

    it("adds _blank target to formatted links in text", function() {
      expect(
        StringUtil.parseMarkdown("Hello this is a [link](http://somelink.com)")
          .__html
      ).toEqual(
        `<p>Hello this is a <a target="_blank" href="http://somelink.com">link</a></p>\n`
      );
    });

    it("does not add target _blank to non-uri segments attached to plain links containing '<a'", function() {
      expect(
        StringUtil.parseMarkdown(
          "Hello this is a bad link http://a.com/<a-mean-uri"
        ).__html
      ).toEqual(
        `<p>Hello this is a bad link <a target="_blank" href="http://a.com/">http://a.com/</a>&lt;a-mean-uri</p>\n`
      );
    });

    it("does not add additional target _blank to uri segments in formatted links containing '<a'", function() {
      expect(
        StringUtil.parseMarkdown(
          "Hello this is a bad [link](http://a.com/<a-mean-uri)"
        ).__html
      ).toEqual(
        `<p>Hello this is a bad <a target="_blank" href="http://a.com/&lt;a-mean-uri">link</a></p>\n`
      );
    });
  });
});
