import AbstractConnection from "../AbstractConnection";
import ConnectionEvent from "../ConnectionEvent";

jest.mock("../AbstractConnection");

describe("ConnectionEvent", () => {
  it("inits", () => {
    expect(() => {
      new ConnectionEvent(new AbstractConnection(), ConnectionEvent.OPEN);
    }).not.toThrowError();
  });
  it("throws on invalid target", () => {
    expect(() => {
      new ConnectionEvent({}, ConnectionEvent.OPEN);
    }).toThrowError();
  });
  it("throws on invalid type", () => {
    expect(() => {
      new ConnectionEvent(new AbstractConnection(), "open");
    }).toThrowError();
  });
});
