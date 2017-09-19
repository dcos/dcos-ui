import ConnectionEvent from "../../ConnectionEvent/ConnectionEvent";
import XHRConnection from "../XHRConnection";

const token = "Token";
const url = "http://example.com/url.json";
const originalXhr = global.XMLHttpRequest;

describe("XHRConnection", () => {
  beforeEach(function() {
    const xhr = function() {
      this.events = {
        progress: [],
        abort: [],
        error: [],
        load: [],
        timeout: []
      };
      this.open = jest.fn();
      this.setRequestHeader = jest.fn();
      this.send = jest.fn();
      this.abort = jest.fn();
      this.addEventListener = (type, callback) => {
        this.events[type].push(callback);
      };
      this.__emit = type => {
        this.events[type].forEach(callback => {
          callback();
        });
      };
    };

    global.XMLHttpRequest = jest.fn(() => new xhr());
  });

  afterEach(function() {
    global.XMLHttpRequest = originalXhr;
  });

  describe("#initialization", () => {
    it("initializes with url", () => {
      expect(() => new XHRConnection(url)).not.toThrow();
    });
    it("initializes with url and method", function() {
      expect(() => {
        return new XHRConnection(url, { method: "POST" });
      }).not.toThrowError();
    });
    it("initializes with url, method and body", function() {
      expect(() => {
        return new XHRConnection(
          url,
          "POST",
          JSON.stringify({ foo: "bar", baz: 0 })
        );
      }).not.toThrowError();
    });
    it("initializes with url, method, body and headers", function() {
      expect(() => {
        return new XHRConnection(url, {
          method: "POST",
          body: JSON.stringify({ foo: "bar", baz: 0 }),
          headers: { "content-type": "text/json" }
        });
      }).not.toThrowError();
    });
    it("fails to initialize without url", () => {
      expect(() => new XHRConnection()).toThrow();
    });
  });
  describe("#open", () => {
    it("opens without token", function() {
      expect(() => {
        return new XHRConnection(url).open();
      }).not.toThrowError();
    });
    it("opens connection with token", function() {
      expect(() => {
        return new XHRConnection(url).open(token);
      }).not.toThrowError();
    });
    it("opens correctly with given token", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(req.xhr.setRequestHeader.mock.calls).toContainEqual([
        "Authorization",
        "Bearer " + token
      ]);
    });
    it("opens connection with correct url", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(req.xhr.open.mock.calls).toEqual([["GET", url]]);
    });
    ["GET", "POST", "DELETE", "PUT"].forEach(method => {
      it(`opens connection with given method (${method})`, function() {
        const req = new XHRConnection(url, { method });
        req.open(token);
        expect(req.xhr.open.mock.calls).toEqual([[method, url]]);
      });
    });
    it("opens connection with correct body", () => {
      const body = { foo: "bar" };
      const req = new XHRConnection(url, { method: "POST", body });
      req.open();
      expect(req.xhr.send.mock.calls).toEqual([[body]]);
    });
    it("opens connection with correct header", () => {
      const headers = { foo: "bar" };
      const req = new XHRConnection(url, {
        method: "POST",
        body: null,
        headers
      });
      req.open();
      expect(req.xhr.setRequestHeader.mock.calls).toEqual([["foo", "bar"]]);
    });
  });
  describe("state", () => {
    it("has correct state on init", () => {
      const req = new XHRConnection(url);

      expect(req.state).toEqual(XHRConnection.INIT);
    });
    it("sets correct state on open", () => {
      const req = new XHRConnection(url);

      req.open(token);

      expect(req.state).toEqual(XHRConnection.STARTED);
    });

    it("sets correct state on abort", () => {
      const req = new XHRConnection(url);

      req.open(token);
      req.xhr.__emit("abort");

      expect(req.state).toEqual(XHRConnection.DONE);
    });

    it("sets correct state on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.__emit("error");

      expect(req.state).toEqual(XHRConnection.DONE);
    });

    it("sets correct state on load", () => {
      const req = new XHRConnection(url);

      req.open(token);
      req.xhr.status = 200;
      req.xhr.__emit("load");

      expect(req.state).toEqual(XHRConnection.DONE);
    });

    it("sets correct state on timeout", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.status = 400;
      req.xhr.__emit("error");

      expect(req.state).toEqual(XHRConnection.DONE);
    });
  });
  describe("events", () => {
    it("emits open event on open", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.on(ConnectionEvent.OPEN, cb);
      req.open(token);

      expect(cb).toHaveBeenCalled();
    });

    it("emits abort event on abort", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.ABORT, cb);
      req.xhr.__emit("abort");

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on abort", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.CLOSE, cb);
      req.xhr.__emit("abort");

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.__emit("error");

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.CLOSE, cb);
      req.addListener(ConnectionEvent.ERROR, () => {});
      req.xhr.__emit("error");

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on load (error)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.status = 400;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });

    it("emits success event on load (success)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.SUCCESS, cb);
      req.xhr.status = 200;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on load (always)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener(ConnectionEvent.CLOSE, cb);
      req.xhr.status = 200;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });
  });
});
