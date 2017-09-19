import { default as Connection } from "../../Connection/AbstractConnection";

jest.mock("../../Connection/AbstractConnection");

export default function ConnectionQueue() {
  const func = jest.fn(() => {
    return new ConnectionQueue();
  });
  let size = 0;
  this.enqueue = func;
  this.dequeue = func;
  this.first = jest.fn(() => new Connection());
  this.shift = func;
  this.__setSize = _size => (size = _size);
  Object.defineProperty(this, "size", {
    get: jest.fn(() => size)
  });
}

console.log("mocking ConnectionQueue");
