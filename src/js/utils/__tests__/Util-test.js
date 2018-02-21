const Util = require("../Util");

let thisSearchObject, thisSearchString, thisFunc, thisDebounced;

describe("Util", function() {
  describe("#uniqueID", function() {
    it("returns a unique ID each time it is called", function() {
      const ids = Array(100).fill(null);
      ids.forEach(function(value, index) {
        ids[index] = Util.uniqueID("100");
      });

      const result = ids.every(function(id, index, array) {
        return !array.includes(id, index + 1);
      });

      expect(result).toBeTruthy();
    });

    it("provides an integer", function() {
      const id = Util.uniqueID("integerID");

      expect(typeof id === "number" && id % 1 === 0).toBeTruthy();
    });

    it("starts over from 0 for each namespace", function() {
      Util.uniqueID("firstNamespace");
      Util.uniqueID("firstNamespace");
      const id1 = Util.uniqueID("firstNamespace");
      const id2 = Util.uniqueID("secondNamespace");

      expect(id1).toEqual(2);
      expect(id2).toEqual(0);
    });
  });

  describe("#omit", function() {
    it("returns a copy of the object", function() {
      var obj = { foo: "bar" };
      var newObject = Util.omit(obj, []);

      newObject.foo = "modified";

      expect(obj.foo).toEqual("bar");
    });

    it("omits key given", function() {
      var obj = {
        foo: "bar",
        qq: "zzz"
      };
      var newObject = Util.omit(obj, ["qq"]);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.foo).toEqual("bar");
      expect(newObject.qq).toEqual(undefined);
    });

    it("omits multiple keys", function() {
      var obj = {
        foo: "bar",
        qq: "zzz",
        three: "pie"
      };
      var newObject = Util.omit(obj, ["foo", "three"]);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.qq).toEqual("zzz");
      expect(newObject.three).toEqual(undefined);
    });
  });

  describe("#last", function() {
    describe("with incorrect input", function() {
      it("returns null for objects", function() {
        var last = Util.last({});

        expect(last).toEqual(null);
      });

      it("returns null for strings", function() {
        var last = Util.last("bla");

        expect(last).toEqual(null);
      });

      it("returns null for Numbers", function() {
        var last = Util.last(NaN);

        expect(last).toEqual(null);
      });

      it("returns null for undefined", function() {
        var last = Util.last(undefined);

        expect(last).toEqual(null);
      });
    });

    describe("with correct input", function() {
      it("returns the last element in an array", function() {
        var array = [0, 1, 2, 3];
        var last = Util.last(array);

        expect(last).toEqual(3);
      });

      it("returns the last element for an array of size 1", function() {
        var array = [0];
        var last = Util.last(array);

        expect(last).toEqual(0);
      });

      it("returns null when given empty array", function() {
        var array = [];
        var last = Util.last(array);

        expect(last).toEqual(null);
      });
    });
  });

  describe("#findLastIndex", function() {
    it("returns -1 if empty array", function() {
      var array = [];
      var index = Util.findLastIndex(array, function(obj) {
        return obj === 1;
      });
      expect(index).toEqual(-1);
    });
    it("returns -1 if not found", function() {
      var array = [1, 2, 3, 4, 5];
      var index = Util.findLastIndex(array, function(obj) {
        return obj === 6;
      });
      expect(index).toEqual(-1);
    });
    it("returns 4", function() {
      var array = [3, 3, 2, 3, 3, 5];
      var index = Util.findLastIndex(array, function(obj) {
        return obj === 3;
      });
      expect(index).toEqual(4);
    });
    it("returns 1", function() {
      var array = [
        { a: "a", b: "bbb" },
        { a: "a", b: "bbb" },
        { a: "a", b: "b" }
      ];
      var index = Util.findLastIndex(array, function(obj) {
        return obj.b === "bbb";
      });
      expect(index).toEqual(1);
    });
  });

  describe("#findNestedPropertyInObject", function() {
    beforeEach(function() {
      thisSearchObject = {
        hello: {
          is: { it: { me: { you: { are: { looking: { for: "?" } } } } } }
        }
      };
      thisSearchString = "hello.is.it.me.you.are.looking.for";
    });

    it("finds a nested defined property", function() {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, thisSearchString)
      ).toEqual("?");
    });

    it("handles nested empty string definitions gracefully", function() {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, "hello.")
      ).toEqual(undefined);
    });

    it("handles null search object gracefully", function() {
      expect(Util.findNestedPropertyInObject(null, thisSearchString)).toEqual(
        null
      );
    });

    it("handles undefined gracefully", function() {
      expect(
        Util.findNestedPropertyInObject(undefined, thisSearchString)
      ).toEqual(null);
    });

    it("handles nested empty strings gracefully", function() {
      expect(Util.findNestedPropertyInObject(thisSearchObject, ".")).toEqual(
        undefined
      );
    });

    it("handles nested empty string definition gracefully", function() {
      expect(Util.findNestedPropertyInObject(thisSearchObject, "")).toEqual(
        undefined
      );
    });

    it("handles null definition gracefully", function() {
      expect(Util.findNestedPropertyInObject(thisSearchObject, null)).toEqual(
        null
      );
    });

    it("handles undefined definition gracefully", function() {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, undefined)
      ).toEqual(null);
    });
  });

  describe("#debounce", function() {
    beforeEach(function() {
      thisFunc = jest.genMockFunction();
      thisDebounced = Util.debounce(thisFunc, 200).bind(this, {
        nativeEvent: {}
      });
    });

    it("calls the function", function() {
      thisDebounced();
      jest.runAllTimers();

      expect(thisFunc.mock.calls.length).toBe(1);
    });

    it("it calls the function only once after consecutive calls", function() {
      thisDebounced();
      thisDebounced();
      thisDebounced();
      jest.runAllTimers();

      expect(thisFunc.mock.calls.length).toBe(1);
    });

    it("calls function with final arguments", function() {
      thisDebounced("foo");
      thisDebounced("bar");
      thisDebounced("baz");
      jest.runAllTimers();

      expect(thisFunc.mock.calls[0][1]).toBe("baz");
    });
  });

  describe("deepCopy", function() {
    it("it returns an actual deep copy", function() {
      var currentDate = new Date();

      var originalObject = {
        obj1: {
          string2: "string2",
          number2: 2,
          func() {
            return true;
          },
          obj2: {
            string3: "string3",
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ["a", "b"],
              number3: 3
            }
          }
        },
        string1: "string1",
        number1: 1,
        array1: [1, 2]
      };

      var copiedObject = Util.deepCopy(originalObject);
      expect(copiedObject).toEqual(originalObject);
    });

    it("mutating the copy does not affect the original", function() {
      var currentDate = new Date();

      var originalObject = {
        obj1: {
          obj2: {
            string3: "string3",
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ["a", "b"],
              number3: 3
            }
          }
        },
        string1: "string1",
        number1: 1,
        array1: [1, 2]
      };

      // An exact replica of the originalObject
      var originalObject2 = {
        obj1: {
          obj2: {
            string3: "string3",
            number3: 3,
            date: currentDate,
            obj3: {
              array2: ["a", "b"],
              number3: 3
            }
          }
        },
        string1: "string1",
        number1: 1,
        array1: [1, 2]
      };

      var copiedObject = Util.deepCopy(originalObject);
      copiedObject.obj1.obj2 = null;
      expect(copiedObject).not.toEqual(originalObject);
      expect(originalObject2).toEqual(originalObject);
    });

    it("does not clone out of bounds arrays", function() {
      var originalObject = {
        obj1: {
          array1: [1, 2]
        }
      };

      var number = 83864234234;
      originalObject.obj1.array1[number] = 3;

      var copiedObject = Util.deepCopy(originalObject);
      expect(copiedObject).not.toEqual(originalObject);
    });

    it("does clone an array with normal indices", function() {
      var originalObject = {
        array: []
      };
      originalObject.array[0] = "test";

      var expectedObject = {
        array: []
      };
      expectedObject.array[0] = "test";

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });

    it("does clone an array with unusual small indices", function() {
      var originalObject = {
        array: []
      };
      originalObject.array[2] = "test";

      var expectedObject = {
        array: []
      };
      expectedObject.array[2] = "test";

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });
  });

  describe("#filterEmptyValues", function() {
    it("filters empty values from an Object", function() {
      const expectedObject = {
        booleanFalse: false,
        booleanTrue: true,
        string: "string",
        array: [1, 2, 3],
        object: { a: 1 },
        number: 123
      };

      expect(
        Util.filterEmptyValues({
          booleanFalse: false,
          booleanTrue: true,
          emptyString: "",
          string: "string",
          emptyArray: [],
          array: [1, 2, 3],
          emptyObject: {},
          object: { a: 1 },
          number: 123,
          nullValue: null,
          undefinedValue: undefined
        })
      ).toEqual(expectedObject);
    });
  });

  describe("#objectToGetParams", function() {
    it("returns empty string when no params has been provided", function() {
      expect(Util.objectToGetParams({})).toEqual("");
    });

    it("returns filters out null value params", function() {
      expect(Util.objectToGetParams({ force: null, use: undefined })).toEqual(
        ""
      );
    });

    it("returns correct query string", function() {
      expect(
        Util.objectToGetParams({ name: "DCOS", partialUpdate: true })
      ).toEqual("?name=DCOS&partialUpdate=true");
    });

    it("escapes both param and its value", function() {
      expect(Util.objectToGetParams({ "es%cape": "/some/param" })).toEqual(
        "?es%25cape=%2Fsome%2Fparam"
      );
    });
  });

  describe("#toLowerCaseIfString", function() {
    it("lowers case string", function() {
      expect(Util.toLowerCaseIfString("Name")).toEqual("name");
    });

    it("returns original param", function() {
      const value = 10;

      expect(Util.toLowerCaseIfString(value)).toEqual(value);
    });
  });

  describe("#toUpperCaseIfString", function() {
    it("uppers case string", function() {
      expect(Util.toUpperCaseIfString("Name")).toEqual("NAME");
    });

    it("returns original param", function() {
      const value = 10;

      expect(Util.toUpperCaseIfString(value)).toEqual(value);
    });
  });

  describe("#isString", function() {
    it("returns true when argument is type string", function() {
      expect(Util.isString("Name")).toEqual(true);
    });

    it("returns false when argument is NOT type string", function() {
      expect(Util.isString(1)).toEqual(false);
    });
  });

  describe("#parseUrl", function() {
    it("returns url object representation", function() {
      const expectedResult = {
        hash: "",
        host: "google.com",
        hostname: "google.com",
        href: "http://google.com/",
        origin: "http://google.com",
        password: "",
        pathname: "/",
        port: "",
        protocol: "http:",
        search: "",
        username: ""
      };
      const url = "http://google.com";

      expect(Util.parseUrl(url)).toEqual(expectedResult);
    });

    it("returns null", function() {
      expect(Util.parseUrl(1)).toEqual(null);
    });

    it("returns absolute url if doesn't have protocol", function() {
      const parsedUrl = Util.parseUrl("www.google.com");
      const expectedResult = "https://www.google.com/";

      expect(parsedUrl.href).toEqual(expectedResult);
    });
  });
});
