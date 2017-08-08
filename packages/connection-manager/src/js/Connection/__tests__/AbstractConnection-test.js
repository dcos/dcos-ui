import AbstractConnection from "../AbstractConnection.js";

describe("AbstractConnection", () => {
  it("throws Error on Init", () => {
    expect(() => {
      new AbstractConnection("foo.json");
    }).toThrowError();
  });
});
