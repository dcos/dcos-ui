import Util from "../Util";

let thisSearchObject, thisSearchString, thisFunc, thisDebounced;

describe("Util", () => {
  describe("#uniqueID", () => {
    it("returns a unique ID each time it is called", () => {
      const ids = Array(100).fill(null);
      ids.forEach((value, index) => {
        ids[index] = Util.uniqueID("100");
      });

      const result = ids.every(
        (id, index, array) => !array.includes(id, index + 1)
      );

      expect(result).toBeTruthy();
    });

    it("provides an integer", () => {
      const id = Util.uniqueID("integerID");

      expect(typeof id === "number" && id % 1 === 0).toBeTruthy();
    });

    it("starts over from 0 for each namespace", () => {
      Util.uniqueID("firstNamespace");
      Util.uniqueID("firstNamespace");
      const id1 = Util.uniqueID("firstNamespace");
      const id2 = Util.uniqueID("secondNamespace");

      expect(id1).toEqual(2);
      expect(id2).toEqual(0);
    });
  });

  describe("#omit", () => {
    it("returns a copy of the object", () => {
      const obj = { foo: "bar" };
      const newObject = Util.omit(obj, []);

      newObject.foo = "modified";

      expect(obj.foo).toEqual("bar");
    });

    it("omits key given", () => {
      const obj = {
        foo: "bar",
        qq: "zzz"
      };
      const newObject = Util.omit(obj, ["qq"]);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.foo).toEqual("bar");
      expect(newObject.qq).toEqual(undefined);
    });

    it("omits multiple keys", () => {
      const obj = {
        foo: "bar",
        qq: "zzz",
        three: "pie"
      };
      const newObject = Util.omit(obj, ["foo", "three"]);

      expect(Object.keys(newObject).length).toEqual(1);
      expect(newObject.qq).toEqual("zzz");
      expect(newObject.three).toEqual(undefined);
    });
  });

  describe("#pluck", () => {
    it("returns a copy of the object", () => {
      const obj = { foo: "bar" };
      const newObject = Util.pluck(obj, []);

      newObject.foo = "modified";

      expect(obj.foo).toEqual("bar");
    });

    it("allows multiple keys", () => {
      const obj = {
        foo: "bar",
        qq: "zzz",
        three: "pie"
      };
      const newObject = Util.pluck(obj, ["foo", "three"]);

      expect(Object.keys(newObject).length).toEqual(2);
      expect(newObject.foo).toEqual("bar");
      expect(newObject.qq).toEqual(undefined);
      expect(newObject.three).toEqual("pie");
    });
  });

  describe("#last", () => {
    describe("with incorrect input", () => {
      it("returns null for objects", () => {
        const last = Util.last({});

        expect(last).toEqual(null);
      });

      it("returns null for strings", () => {
        const last = Util.last("bla");

        expect(last).toEqual(null);
      });

      it("returns null for Numbers", () => {
        const last = Util.last(NaN);

        expect(last).toEqual(null);
      });

      it("returns null for undefined", () => {
        const last = Util.last(undefined);

        expect(last).toEqual(null);
      });
    });

    describe("with correct input", () => {
      it("returns the last element in an array", () => {
        const array = [0, 1, 2, 3];
        const last = Util.last(array);

        expect(last).toEqual(3);
      });

      it("returns the last element for an array of size 1", () => {
        const array = [0];
        const last = Util.last(array);

        expect(last).toEqual(0);
      });

      it("returns null when given empty array", () => {
        const array = [];
        const last = Util.last(array);

        expect(last).toEqual(null);
      });
    });
  });

  describe("#findLastIndex", () => {
    it("returns -1 if empty array", () => {
      const array = [];
      const index = Util.findLastIndex(array, obj => obj === 1);
      expect(index).toEqual(-1);
    });
    it("returns -1 if not found", () => {
      const array = [1, 2, 3, 4, 5];
      const index = Util.findLastIndex(array, obj => obj === 6);
      expect(index).toEqual(-1);
    });
    it("returns 4", () => {
      const array = [3, 3, 2, 3, 3, 5];
      const index = Util.findLastIndex(array, obj => obj === 3);
      expect(index).toEqual(4);
    });
    it("returns 1", () => {
      const array = [
        { a: "a", b: "bbb" },
        { a: "a", b: "bbb" },
        { a: "a", b: "b" }
      ];
      const index = Util.findLastIndex(array, obj => obj.b === "bbb");
      expect(index).toEqual(1);
    });
  });

  describe("#findNestedPropertyInObject", () => {
    beforeEach(() => {
      thisSearchObject = {
        hello: {
          is: { it: { me: { you: { are: { looking: { for: "?" } } } } } }
        }
      };
      thisSearchString = "hello.is.it.me.you.are.looking.for";
    });

    it("finds a nested defined property", () => {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, thisSearchString)
      ).toEqual("?");
    });

    it("handles nested empty string definitions gracefully", () => {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, "hello.")
      ).toEqual(undefined);
    });

    it("handles null search object gracefully", () => {
      expect(Util.findNestedPropertyInObject(null, thisSearchString)).toEqual(
        null
      );
    });

    it("handles undefined gracefully", () => {
      expect(
        Util.findNestedPropertyInObject(undefined, thisSearchString)
      ).toEqual(null);
    });

    it("handles nested empty strings gracefully", () => {
      expect(Util.findNestedPropertyInObject(thisSearchObject, ".")).toEqual(
        undefined
      );
    });

    it("handles nested empty string definition gracefully", () => {
      expect(Util.findNestedPropertyInObject(thisSearchObject, "")).toEqual(
        undefined
      );
    });

    it("handles null definition gracefully", () => {
      expect(Util.findNestedPropertyInObject(thisSearchObject, null)).toEqual(
        null
      );
    });

    it("handles undefined definition gracefully", () => {
      expect(
        Util.findNestedPropertyInObject(thisSearchObject, undefined)
      ).toEqual(null);
    });
  });

  describe("#debounce", () => {
    beforeEach(function() {
      thisFunc = jest.fn();
      thisDebounced = Util.debounce(thisFunc, 200).bind(this, {
        nativeEvent: {}
      });
    });

    it("calls the function", () => {
      thisDebounced();
      jest.runAllTimers();

      expect(thisFunc.mock.calls.length).toBe(1);
    });

    it("it calls the function only once after consecutive calls", () => {
      thisDebounced();
      thisDebounced();
      thisDebounced();
      jest.runAllTimers();

      expect(thisFunc.mock.calls.length).toBe(1);
    });

    it("calls function with final arguments", () => {
      thisDebounced("foo");
      thisDebounced("bar");
      thisDebounced("baz");
      jest.runAllTimers();

      expect(thisFunc.mock.calls[0][1]).toBe("baz");
    });
  });

  describe("deepCopy", () => {
    it("it returns an actual deep copy", () => {
      const currentDate = new Date();

      const originalObject = {
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

      const copiedObject = Util.deepCopy(originalObject);
      expect(copiedObject).toEqual(originalObject);
    });

    it("mutating the copy does not affect the original", () => {
      const currentDate = new Date();

      const originalObject = {
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
      const originalObject2 = {
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

      const copiedObject = Util.deepCopy(originalObject);
      copiedObject.obj1.obj2 = null;
      expect(copiedObject).not.toEqual(originalObject);
      expect(originalObject2).toEqual(originalObject);
    });

    it("does not clone out of bounds items in arrays", () => {
      const originalObject = {
        obj1: {
          array1: [1, 2]
        }
      };

      const number = 83864234234;
      originalObject.obj1.array1[number] = 3;

      const copiedObject = Util.deepCopy(originalObject);
      expect(originalObject.obj1.array1[number]).toEqual(3);
      expect(copiedObject.obj1.array1[number]).not.toEqual(3);
    });

    it("does clone an array with normal indices", () => {
      const originalObject = {
        array: []
      };
      originalObject.array[0] = "test";

      const expectedObject = {
        array: []
      };
      expectedObject.array[0] = "test";

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });

    it("does clone an array with unusual small indices", () => {
      const originalObject = {
        array: []
      };
      originalObject.array[2] = "test";

      const expectedObject = {
        array: []
      };
      expectedObject.array[2] = "test";

      expect(Util.deepCopy(originalObject)).toEqual(expectedObject);
    });
  });

  describe("#filterEmptyValues", () => {
    it("filters empty values from an Object", () => {
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

  describe("#objectToGetParams", () => {
    it("returns empty string when no params has been provided", () => {
      expect(Util.objectToGetParams({})).toEqual("");
    });

    it("returns filters out null value params", () => {
      expect(Util.objectToGetParams({ force: null, use: undefined })).toEqual(
        ""
      );
    });

    it("returns correct query string", () => {
      expect(
        Util.objectToGetParams({ name: "DCOS", partialUpdate: true })
      ).toEqual("?name=DCOS&partialUpdate=true");
    });

    it("escapes both param and its value", () => {
      expect(Util.objectToGetParams({ "es%cape": "/some/param" })).toEqual(
        "?es%25cape=%2Fsome%2Fparam"
      );
    });
  });

  describe("#toLowerCaseIfString", () => {
    it("lowers case string", () => {
      expect(Util.toLowerCaseIfString("Name")).toEqual("name");
    });

    it("returns original param", () => {
      const value = 10;

      expect(Util.toLowerCaseIfString(value)).toEqual(value);
    });
  });

  describe("#toUpperCaseIfString", () => {
    it("uppers case string", () => {
      expect(Util.toUpperCaseIfString("Name")).toEqual("NAME");
    });

    it("returns original param", () => {
      const value = 10;

      expect(Util.toUpperCaseIfString(value)).toEqual(value);
    });
  });

  describe("#isString", () => {
    it("returns true when argument is type string", () => {
      expect(Util.isString("Name")).toEqual(true);
    });

    it("returns false when argument is NOT type string", () => {
      expect(Util.isString(1)).toEqual(false);
    });
  });

  describe("#parseUrl", () => {
    it("returns url object representation", () => {
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

    it("returns null", () => {
      expect(Util.parseUrl(1)).toEqual(null);
    });

    it("returns absolute url if doesn't have protocol", () => {
      const parsedUrl = Util.parseUrl("www.google.com");
      const expectedResult = "https://www.google.com/";

      expect(parsedUrl.href).toEqual(expectedResult);
    });
  });
});
