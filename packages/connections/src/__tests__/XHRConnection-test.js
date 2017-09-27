import ConnectionEvent from "../ConnectionEvent";
import XHRConnection from "../XHRConnection";

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

    it("initializes with url and valid options", function() {
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

    it("throws on invalid options (method)", function() {
      expect(() => {
        return new XHRConnection(url, {
          method: "HEAD",
          body: JSON.stringify({ foo: "bar", baz: 0 }),
          headers: { "content-type": "text/json" }
        });
      }).toThrowError();
    });

    it("throws on invalid options (header)", function() {
      expect(() => {
        return new XHRConnection(url, {
          method: "GET",
          body: JSON.stringify({ foo: "bar", baz: 0 }),
          headers: "content-type: text/json"
        });
      }).toThrowError();
    });
  });

  describe("#open", () => {
    it("opens connection with correct url", function() {
      const req = new XHRConnection(url);
      req.open();
      expect(req.xhr.open.mock.calls).toEqual([["GET", url]]);
    });

    ["GET", "POST", "DELETE", "PUT"].forEach(method => {
      it(`opens connection with given method (${method})`, function() {
        const req = new XHRConnection(url, { method });
        req.open();
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

    it("does nothing when open an already opened connection again", () => {
      const req = new XHRConnection(url);
      req.state = XHRConnection.OPEN;
      req.open();
      expect(req.xhr.open).not.toHaveBeenCalled();
    });

    it("does nothing when opening an already closed connection again", () => {
      const req = new XHRConnection(url);
      req.state = XHRConnection.CLOSED;
      req.open();
      expect(req.xhr.open).not.toHaveBeenCalled();
      expect(req.state).toBe(XHRConnection.CLOSED);
    });
  });

  describe("#close", () => {
    it("closes open connection", function() {
      const req = new XHRConnection(url);
      req.open();
      expect(() => req.close()).not.toThrow();
    });

    it("does nothing when closing an not yet opened connection", () => {
      const req = new XHRConnection(url);
      req.close();
      expect(req.xhr.abort).not.toHaveBeenCalled();
      expect(req.state).toBe(XHRConnection.CLOSED);
    });

    it("does nothing when closing an already closed connection again", () => {
      const req = new XHRConnection(url);
      req.state = XHRConnection.CLOSED;
      req.close();
      expect(req.xhr.abort).not.toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("has correct state on init", () => {
      const req = new XHRConnection(url);

      expect(req.state).toEqual(XHRConnection.INIT);
    });

    it("sets correct state on open", () => {
      const req = new XHRConnection(url);

      req.open();

      expect(req.state).toEqual(XHRConnection.OPEN);
    });

    it("sets correct state on abort", () => {
      const req = new XHRConnection(url);

      req.open();
      req.xhr.__emit("abort");

      expect(req.state).toEqual(XHRConnection.CLOSED);
    });

    it("sets correct state on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.__emit("error");

      expect(req.state).toEqual(XHRConnection.CLOSED);
    });

    it("sets correct state on load", () => {
      const req = new XHRConnection(url);

      req.open();
      req.xhr.status = 200;
      req.xhr.__emit("load");

      expect(req.state).toEqual(XHRConnection.CLOSED);
    });

    it("sets correct state on timeout", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.status = 400;
      req.xhr.__emit("error");

      expect(req.state).toEqual(XHRConnection.CLOSED);
    });
  });
  describe("events", () => {
    it("emits open event on open", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.on(ConnectionEvent.OPEN, cb);
      req.open();

      expect(cb).toHaveBeenCalled();
    });

    it("emits abort event on abort", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ABORT, cb);
      req.xhr.__emit("abort");

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.__emit("error");

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on load when receiving a 400", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.status = 400;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on load when receiving a 500", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.ERROR, cb);
      req.xhr.status = 500;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });

    it("emits complete event on load", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open();
      req.addListener(ConnectionEvent.COMPLETE, cb);
      req.xhr.status = 200;
      req.xhr.__emit("load");

      expect(cb).toHaveBeenCalled();
    });
  });
  describe("response", () => {
    it("get correct resonse from xhr (json)", () => {
      const req = new XHRConnection(url);
      const str = `{"foo":"bar"}`;
      const json = JSON.parse(str);
      req.xhr.response = json;
      req.xhr.responseType = "json";
      expect(req.response).toEqual(json);
    });
    it("get correct resonse from xhr (ie11 polyfill)", () => {
      const req = new XHRConnection(url);
      const str = `{"foo":"bar"}`;
      const json = JSON.parse(str);
      req.xhr.response = str;
      req.xhr.responseType = "";
      expect(req.response).toEqual(json);
    });
  });
});
