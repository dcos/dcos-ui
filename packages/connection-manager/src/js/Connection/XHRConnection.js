import AbstractConnection from "./AbstractConnection";
import ConnectionEvent from "../ConnectionEvent/ConnectionEvent";

export const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

/**
 * Basic XHR Connection
 * @todo add/remove headers
 */
export default class XHRConnection extends AbstractConnection {
  /**
   * Initializes an Instance of XHRConnection
   * @constructor
   * @param {string} url – URL to be fetched
   * @param {object} [options]
   * @param {string} [options.method=GET] – used method
   * @param {*} [options.body] – payload for request
   * @param {string} [options.headers] – additional headers (like content-type)
   */
  constructor(url, options = {}) {
    super(url);

    const {
      method = "GET",
      body = null,
      headers = null,
      responseType = "json"
    } = options;

    let _method;
    Object.defineProperty(this, "method", {
      get: () => _method,
      set: __method => {
        if (ALLOWED_METHODS.includes(__method) === -1) {
          throw new Error("Invalid method for XHR Request.");
        }
        _method = __method;
      }
    });
    this.method = method;

    let _body;
    Object.defineProperty(this, "body", {
      get: () => _body,
      set: __body => {
        _body = __body;
      }
    });
    this.body = body;

    let _headers = {};
    Object.defineProperty(this, "headers", {
      get: () => _headers,
      set: __headers => {
        _headers = Object.assign(_headers, __headers);
      }
    });
    this.headers = headers;

    let _responseType = {};
    Object.defineProperty(this, "responseType", {
      get: () => _responseType,
      set: __responseType => {
        _responseType = __responseType;
      }
    });
    this.responseType = responseType;

    let xhr = null;
    Object.defineProperty(this, "xhr", {
      get: () => xhr,
      set: _xhr => {
        if (_xhr === null) {
          throw new Error(
            "Given XMLHttpRequest has to be an instance of XMLHttpRequest"
          );
        }
        if (
          this.state !== XHRConnection.INIT &&
          this.state !== XHRConnection.CANCELLED
        ) {
          xhr.abort();
          this.emit(ConnectionEvent.ERROR);
        }
        xhr = _xhr;
        this.state = XHRConnection.INIT;
      }
    });
  }

  /**
   * more xhr related getter
   * @todo make them more robust / do we need more?
   */
  get response() {
    return this.xhr && this.xhr.response;
  }
  get readyState() {
    return this.xhr && this.xhr.readyState;
  }
  get status() {
    return this.xhr && this.xhr.status;
  }

  /**
   * create, prepare, open and send the xhr request
   * @param {string} [token] – authentication token
   */
  open(token) {
    super.open(token);

    /**
     * handle open  of native xhr
     */
    const handleProgress = function() {
      this.emit(
        ConnectionEvent.DATA,
        new ConnectionEvent(this, ConnectionEvent.DATA)
      );
    }.bind(this);
    /**
     * handle abort  of native xhr
     */
    const handleAbort = function() {
      this.state = XHRConnection.DONE;
      this.emit(
        ConnectionEvent.ABORT,
        new ConnectionEvent(this, ConnectionEvent.ABORT)
      );
      this.emit(
        ConnectionEvent.CLOSE,
        new ConnectionEvent(this, ConnectionEvent.CLOSE)
      );
    }.bind(this);
    /**
     * handle error  of native xhr
     */
    const handleError = function() {
      this.state = XHRConnection.DONE;
      this.emit(
        ConnectionEvent.ERROR,
        new ConnectionEvent(this, ConnectionEvent.ERROR)
      );
      this.emit(
        ConnectionEvent.CLOSE,
        new ConnectionEvent(this, ConnectionEvent.CLOSE)
      );
    }.bind(this);
    /**
     * handle load of native xhr
     */
    const handleLoad = function() {
      this.state = XHRConnection.DONE;
      if (this.status >= 400) {
        this.emit(
          ConnectionEvent.ERROR,
          new ConnectionEvent(this, ConnectionEvent.ERROR)
        );
      } else {
        this.emit(
          ConnectionEvent.SUCCESS,
          new ConnectionEvent(this, ConnectionEvent.SUCCESS)
        );
      }
      this.emit(
        ConnectionEvent.CLOSE,
        new ConnectionEvent(this, ConnectionEvent.CLOSE)
      );
    }.bind(this);
    /**
     * handle timeout of native xhr
     */
    const handleTimeout = function() {
      handleError();
    };

    if (this.xhr !== null) {
      throw new Error("cannot open XHR Connection a second time!");
    }
    this.xhr = new XMLHttpRequest();

    this.xhr.addEventListener("progress", handleProgress);
    this.xhr.addEventListener("abort", handleAbort);
    this.xhr.addEventListener("error", handleError);
    this.xhr.addEventListener("load", handleLoad);
    this.xhr.addEventListener("timeout", handleTimeout);
    this.xhr.open(this.method, this.url);

    this.state = XHRConnection.STARTED;
    this.emit(
      ConnectionEvent.OPEN,
      new ConnectionEvent(this, ConnectionEvent.OPEN)
    );

    Object.keys(this.headers).forEach(key => {
      if (this.headers[key] !== undefined && this.headers[key] !== null) {
        this.xhr.setRequestHeader(key, this.headers[key]);
      }
    });

    if (token !== undefined && token !== "") {
      this.xhr.setRequestHeader("Authorization", "Bearer " + token);
    }

    this.xhr.responseType = this.responseType;
    this.xhr.send(this.body);
  }
  /**
   * aborts native xhr
   */
  close() {
    super.close();

    if (this.xhr === null || this.state === XHRConnection.INIT) {
      throw new Error("XMLHttpRequest not open, cant close it.");
    }
    this.xhr.abort();
  }
  /**
   *
   * @todo abort here before delete?
   */
  reset() {
    super.reset();

    this.state = XHRConnection.CANCELLED;
    this.xhr = null;
  }
}
