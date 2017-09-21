import { AbstractConnection } from "connections";

import ConnectionQueueItem, { MINIMUM_PRIORITY } from "../ConnectionQueueItem";

jest.mock("connections/src/AbstractConnection");

describe("ConnectionQueueItem", () => {
  describe("#initialization", () => {
    it("initializes with given connection & prio", () => {
      expect(() => {
        new ConnectionQueueItem(new AbstractConnection(), 5);
      }).not.toThrow();
    });

    it("initializes with given connection", () => {
      expect(() => {
        new ConnectionQueueItem(new AbstractConnection());
      }).not.toThrow();
    });

    it("does not initialize without given connection", () => {
      expect(() => {
        new ConnectionQueueItem();
      }).toThrow();
    });

    it("does not initialize with invalid parameter: connection", () => {
      expect(() => {
        new ConnectionQueueItem({});
      }).toThrow();
    });

    it("does not initialize with invalid parameter: priority (negative)", () => {
      expect(() => {
        new ConnectionQueueItem(new AbstractConnection(), MINIMUM_PRIORITY - 1);
      }).toThrow();
    });

    it("does not initialize with invalid parameter: priority (not number)", () => {
      expect(() => {
        new ConnectionQueueItem(new AbstractConnection(), "low");
      }).toThrow();
    });
  });

  describe("#equals", () => {
    it("compares items with same connections correctly", () => {
      const connection = new AbstractConnection();
      const a = new ConnectionQueueItem(connection, 5);
      const b = new ConnectionQueueItem(connection, 3);
      expect(a.equals(b)).toBe(true);
    });

    it("compares items with different connections correctly", () => {
      const connectionA = new AbstractConnection();
      const connectionB = new AbstractConnection();
      const a = new ConnectionQueueItem(connectionA, 3);
      const b = new ConnectionQueueItem(connectionB, 2);
      expect(a.equals(b)).toBe(false);
    });
  });
});
