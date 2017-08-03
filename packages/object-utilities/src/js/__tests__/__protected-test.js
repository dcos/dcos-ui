jest.dontMock("../__protected");

const __protected = require("../__protected").default;

describe("__protected", () => {
  it("initializes", () => {
    const obj = {};
    expect(__protected(obj)).toEqual({});
  });

  it("throws error without object", () => {
    expect(() => {
      __protected();
    }).toThrowError();
  });

  it("throws error with invalid value", () => {
    const obj = {};
    expect(() => {
      __protected(obj, "foobar");
    }).toThrowError();
  });

  it("saves values through value parameter", () => {
    const obj = {};
    expect(__protected(obj, { foo: "bar" }).foo).toEqual("bar");
  });

  it("saves value through returned object", () => {
    const obj = {};
    __protected(obj).foo = "bar";
    expect(__protected(obj).foo).toEqual("bar");
  });

  it("changes value through value parameter", () => {
    const obj = {};
    __protected(obj, { foo: "bar" });
    expect(__protected(obj, { foo: "baz" }).foo).toEqual("baz");
  });
});
