import { AbstractConnection } from "connections";
import ConnectionQueue from "../ConnectionQueue.js";
import ConnectionQueueItem from "../ConnectionQueueItem.js";

jest.mock("connections/src/AbstractConnection");

describe("ConnectionQueue", () => {
  let connection1 = null;
  let connection2 = null;
  let connection3 = null;

  beforeEach(() => {
    connection1 = new AbstractConnection("http://example.com/1");
    connection2 = new AbstractConnection("http://example.com/2");
    connection3 = new AbstractConnection("http://example.com/3");
  });

  describe("#init", () => {
    it("initializes successfully", () => {
      expect(() => new ConnectionQueue()).not.toThrow();
    });

    it("has correct size after initialization (first)", () => {
      expect(new ConnectionQueue().size).toEqual(0);
    });

    it("is empty after initialization (size)", () => {
      expect(new ConnectionQueue().size).toEqual(0);
    });

    it("throws on initialization with invalid list", () => {
      expect(() => new ConnectionQueue("foobar")).toThrow();
    });
  });

  describe("#enqueue", () => {
    it("enqueues correctly (first)", () => {
      const connection = new AbstractConnection("http://example.com");
      const queue = new ConnectionQueue().enqueue(connection);

      expect(queue.first()).toEqual(connection);
    });

    it("enqueues correctly (size)", () => {
      const connection = new AbstractConnection("http://example.com");
      const queue = new ConnectionQueue().enqueue(connection);

      expect(queue.size).toEqual(1);
    });

    it("sorts connections by priority", () => {
      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2);

      expect(queue.first()).toEqual(connection2);
    });
  });

  describe("#dequeue", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (first)", () => {
        const queue = new ConnectionQueue()
          .enqueue(connection1)
          .dequeue(connection1);

        expect(queue.first()).toBe(undefined);
      });

      it("dequeues correctly (size)", () => {
        const queue = new ConnectionQueue()
          .enqueue(connection1)
          .dequeue(connection1);

        expect(queue.size).toEqual(0);
      });
    });
    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        expect(() => new ConnectionQueue().dequeue(connection1)).not.toThrow();
      });
    });
  });

  describe("#first", function() {
    it("returns first item of queue", function() {
      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2)
        .enqueue(connection3, 3);

      expect(queue.first()).toBe(connection3);
    });
    it("returns undefined when calling first on empty queue", function() {
      const queue = new ConnectionQueue();

      expect(queue.first()).toBe(undefined);
    });
  });

  describe("#shift", function() {
    it("returns a new queue without the first element", function() {
      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2)
        .enqueue(connection3, 3)
        .shift();

      expect(queue.includes(connection3)).toEqual(false);
    });
    it("returns empty queue when shift() on empty queue", function() {
      const queue = new ConnectionQueue().shift();

      expect(queue.size).toEqual(0);
    });
  });

  describe("#includes", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (size)", () => {
        const queue = new ConnectionQueue().enqueue(connection1);

        expect(
          queue.connections.includes(new ConnectionQueueItem(connection1))
        ).toEqual(true);
      });
    });

    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        expect(new ConnectionQueue().includes(connection1)).toEqual(false);
      });
    });
  });
});
