import { AbstractConnection, ConnectionEvent } from "connections";
import ConnectionManagerClass from "../ConnectionManager.js";

jest.mock("connections/src/ConnectionEvent");
jest.mock("connections/src/AbstractConnection");

describe("ConnectionManager", () => {
  let ConnectionManager = null;
  let connection1 = null;
  let connection2 = null;
  let connection3 = null;

  beforeEach(() => {
    ConnectionManager = new ConnectionManagerClass(1);
    connection1 = new AbstractConnection("http://example.com/1");
    connection2 = new AbstractConnection("http://example.com/2");
    connection3 = new AbstractConnection("http://example.com/3");
  });

  describe("#queue", function() {
    it("adds abort listeners to new connection", () => {
      ConnectionManager.enqueue(connection1);

      expect(
        connection1.addListener.mock.calls.find(
          args => args[0] === ConnectionEvent.ABORT
        )
      ).toBeTruthy();
    });

    it("adds complete listeners to new connection", () => {
      ConnectionManager.enqueue(connection1);

      expect(
        connection1.addListener.mock.calls.find(
          args => args[0] === ConnectionEvent.COMPLETE
        )
      ).toBeTruthy();
    });

    it("adds error listeners to new connection", () => {
      ConnectionManager.enqueue(connection1);

      expect(
        connection1.addListener.mock.calls.find(
          args => args[0] === ConnectionEvent.ERROR
        )
      ).toBeTruthy();
    });

    it("does not allow enqueueing of closed connections", () => {
      connection1.state = AbstractConnection.CLOSED;

      expect(() => {
        ConnectionManager.enqueue(connection1);
      }).not.toThrow();
    });

    it("opens connection if slot is free and connection not open yet", () => {
      ConnectionManager.enqueue(connection1);

      expect(connection1.open).toHaveBeenCalled();
    });

    it("doesn't open connections twice", () => {
      connection1.open();

      ConnectionManager.enqueue(connection1);

      expect(connection1.open).toHaveBeenCalledTimes(1);
    });

    it("doesn't open connection if there's no free slot", () => {
      ConnectionManager.enqueue(connection1);
      ConnectionManager.enqueue(connection2);

      expect(connection1.open).toHaveBeenCalled();
      expect(connection2.open).not.toHaveBeenCalled();
    });
  });

  describe("#dequeue", function() {
    beforeEach(() => {
      ConnectionManager.enqueue(connection1);
      ConnectionManager.enqueue(connection2);
      ConnectionManager.enqueue(connection3);
    });

    it("removes abort listeners to new connection", () => {
      ConnectionManager.dequeue(connection1);

      expect(
        connection1.removeListener.mock.calls.find(
          args => args[0] === ConnectionEvent.ABORT
        )
      ).toBeTruthy();
    });

    it("removes complete listeners to new connection", () => {
      ConnectionManager.dequeue(connection1);

      expect(
        connection1.removeListener.mock.calls.find(
          args => args[0] === ConnectionEvent.COMPLETE
        )
      ).toBeTruthy();
    });

    it("removes error listeners to new connection", () => {
      ConnectionManager.dequeue(connection1);

      expect(
        connection1.removeListener.mock.calls.find(
          args => args[0] === ConnectionEvent.ERROR
        )
      ).toBeTruthy();
    });

    it("opens next connection", () => {
      ConnectionManager.dequeue(connection1);

      expect(connection2.open).toHaveBeenCalled();
    });

    it("doesn't open next connection if there's no free slot", () => {
      // This test is important as it verifies that
      connection2.open();

      ConnectionManager.dequeue(connection1);
      expect(connection1.open).toHaveBeenCalled();
      expect(connection3.open).not.toHaveBeenCalled();
    });

    it("dequeue waiting and open connections", () => {
      ConnectionManager.dequeue(connection2);
      ConnectionManager.dequeue(connection1);

      expect(connection2.open).not.toHaveBeenCalled();
      expect(connection3.open).toHaveBeenCalled();
    });

    it("closes open connections", () => {
      ConnectionManager.dequeue(connection1);

      expect(connection1.close).toHaveBeenCalled();
    });
  });
});
