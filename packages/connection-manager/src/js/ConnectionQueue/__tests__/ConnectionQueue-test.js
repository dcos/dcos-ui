import { default as Connection } from "../../Connection/AbstractConnection";
import ConnectionQueue from "../ConnectionQueue.js";

jest.mock("../../Connection/AbstractConnection");
jest.unmock("immutable");

describe("ConnectionQueue", () => {
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
      const connection = new Connection("asd");
      const queue = new ConnectionQueue().enqueue(connection);

      expect(queue.first()).toEqual(connection);
    });

    it("enqueues correctly (size)", () => {
      const connection = new Connection("asd");
      const queue = new ConnectionQueue().enqueue(connection);

      expect(queue.size).toEqual(1);
    });

    it("sorts connections by priority", () => {
      const connection1 = new Connection("1");
      const connection2 = new Connection("2");
      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2);

      expect(queue.first()).toEqual(connection1);
    });
  });

  describe("#dequeue", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (first)", () => {
        const connection = new Connection("asd");
        const queue = new ConnectionQueue()
          .enqueue(connection)
          .dequeue(connection);

        expect(() => queue.first()).toThrow();
      });

      it("dequeues correctly (size)", () => {
        const connection = new Connection("asd");
        const queue = new ConnectionQueue()
          .enqueue(connection)
          .dequeue(connection);

        expect(queue.size).toEqual(0);
      });
    });

    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        const connection = new Connection("asd");
        const queue = new ConnectionQueue().dequeue(connection);

        expect(queue.dequeue(connection)).toEqual(queue);
      });
    });
  });

  describe("#first", function() {
    it("returns first item of queue", function() {
      const connection1 = new Connection("1");
      const connection2 = new Connection("2");
      const connection3 = new Connection("3");

      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2)
        .enqueue(connection3, 3);

      expect(queue.first()).toEqual(connection3);
    });
    it("throws error when calling first on empty queue", function() {
      const queue = new ConnectionQueue();

      expect(() => queue.first()).toThrow();
    });
  });

  describe("#shift", function() {
    it("returns a new queue without the first element", function() {
      const connection1 = new Connection("1");
      const connection2 = new Connection("2");
      const connection3 = new Connection("3");

      const queue = new ConnectionQueue()
        .enqueue(connection1, 1)
        .enqueue(connection2, 2)
        .enqueue(connection3, 3)
        .shift();

      expect(queue.contains(connection1)).toEqual(false);
    });
  });

  describe("#contains", () => {
    describe("with existing connection", function() {
      it("dequeues correctly (size)", () => {
        const connection = new Connection("asd");
        const queue = new ConnectionQueue().enqueue(connection);

        expect(queue.contains(connection)).toEqual(true);
      });
    });

    describe("with connection that doesn't exist", function() {
      it("doesn't do anything", () => {
        const connection = new Connection("asd");
        const queue = new ConnectionQueue().dequeue(connection);

        expect(queue.contains(connection)).toEqual(false);
      });
    });
  });
});
