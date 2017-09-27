import { XHRConnection, ConnectionEvent } from "connections";
import ConnectionManager from "connection-manager";
import request from "../request";

jest.mock("connection-manager/src/ConnectionQueueItem");
jest.mock("connections/src/XHRConnection", function() {
  return jest.fn(function() {
    this.events = {};

    this.addListener = (type, callback) => {
      if (!this.events[type]) {
        this.events[type] = [];
      }
      this.events[type].push(callback);
    };
    this.removeListener = (type, callback) => {
      this.events[type] = this.events[type].filter(
        currCallback => currCallback !== callback
      );
    };
    this.__emit = (type, ...rest) => {
      this.events[type].forEach(callback => {
        callback(...rest);
      });
    };
  });
});

describe("request", () => {
  beforeEach(() => {
    XHRConnection.mockClear();
  });

  describe("with subscribers", () => {
    it("enqueues a connection", () => {
      spyOn(ConnectionManager, "enqueue");
      request("http://localhost").subscribe(() => {});

      expect(ConnectionManager.enqueue).toHaveBeenCalled();
    });

    it("dequeues a connection when there are no subscibers left", () => {
      spyOn(ConnectionManager, "dequeue");
      request("http://localhost").subscribe(jest.fn()).unsubscribe();

      expect(ConnectionManager.dequeue).toHaveBeenCalled();
    });

    it("calls next once and only when connection has completed", () => {
      const observer = {
        next: jest.fn()
      };

      request("http://localhost").subscribe(observer);

      const connectionMock = XHRConnection.mock.instances[0];
      connectionMock.response = "some text";

      const connectionEventMock = { target: connectionMock };
      connectionMock.__emit(ConnectionEvent.COMPLETE, connectionEventMock);

      expect(observer.next).toHaveBeenCalledWith("some text");
    });

    it("emits an error object on connection error", () => {
      const observer = {
        error: jest.fn()
      };

      request("http://localhost").subscribe(observer);

      const connectionMock = XHRConnection.mock.instances[0];
      connectionMock.xhr = {
        status: 404,
        statusText: "Not Found"
      };
      const connectionEventMock = { target: connectionMock };
      connectionMock.__emit(ConnectionEvent.ERROR, connectionEventMock);

      expect(observer.error).toHaveBeenCalledWith({
        code: 404,
        message: "Not Found"
      });
    });
  });

  describe("with no subscribers", () => {
    it("doesn't enqueue a connection", () => {
      spyOn(ConnectionManager, "enqueue");
      request("http://localhost");

      expect(ConnectionManager.enqueue).not.toHaveBeenCalled();
    });
  });
});
