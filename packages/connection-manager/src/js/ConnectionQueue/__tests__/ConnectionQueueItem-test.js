import { default as Connection } from "../../Connection/AbstractConnection";
import ConnectionQueueItem, { MINIMUM_PRIORITY } from "../ConnectionQueueItem";

jest.mock("../../Connection/AbstractConnection");

describe("ConnectionQueueItem", () => {
  describe("#initialization", () => {
    it("initializes with given connection & prio", () => {
      expect(() => {
        new ConnectionQueueItem(new Connection(), 5);
      }).not.toThrow();
    });
    it("initializes with given connection", () => {
      expect(() => {
        new ConnectionQueueItem(new Connection());
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
        new ConnectionQueueItem(new Connection(), MINIMUM_PRIORITY - 1);
      }).toThrow();
    });
    it("does not initialize with invalid parameter: priority (not number)", () => {
      expect(() => {
        new ConnectionQueueItem(new Connection(), "low");
      }).toThrow();
    });
  });
  describe("#equals", () => {
    it("compares items with same connections correctly", () => {
      const connection = new Connection();
      const a = new ConnectionQueueItem(connection, 5);
      const b = new ConnectionQueueItem(connection, 3);
      expect(a.equals(b)).toBe(true);
    });
    it("compares items with different connections correctly", () => {
      const connectionA = new Connection();
      const connectionB = new Connection();
      const a = new ConnectionQueueItem(connectionA, 3);
      const b = new ConnectionQueueItem(connectionB, 2);
      expect(a.equals(b)).toBe(false);
    });
  });
});
