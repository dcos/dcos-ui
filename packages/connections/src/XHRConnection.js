import AbstractConnection from "./AbstractConnection";
import ConnectionEvent from "./ConnectionEvent";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];
const ALLOWED_RESPONSE_TYPES = [
  "arraybuffer",
  "blob",
  "document",
  "json",
  "text"
];

/**
 * Basic XHR Connection
 */
export default class XHRConnection extends AbstractConnection {
  /**
   * Initializes an Instance of XHRConnection
   * @constructor
   * @param {string} url – URL to be fetched
   * @param {object} [options]
   * @param {string} [options.method=GET] – used method
   * @param {*} [options.body] – payload for request
   * @param {object} [options.headers] – additional headers (like content-type)
   * @param {string} [options.responseType]
   * @param {int} [timeout]
   */
  constructor(url, options = {}) {
    super(url);

    const {
      method = "GET",
      body = null,
      headers = {
        Accept: "application/json"
      },
      responseType = "json",
      timeout = 0
    } = options;

    if (!ALLOWED_METHODS.includes(method)) {
      throw new Error(
        `Invalid method "${method}". Valid methods are: "${ALLOWED_METHODS.join('", "')}".`
      );
    }

    if (!ALLOWED_RESPONSE_TYPES.includes(responseType)) {
      throw new Error(
        `Invalid response type "${responseType}". Valid reponse types are "${ALLOWED_RESPONSE_TYPES.join('", "')}".`
      );
    }

    if (typeof headers !== "object") {
      throw new Error(
        `Invalid headers. Type must be "object", is "${typeof headers}".`
      );
    }

    if (!Number.isSafeInteger(timeout) || timeout < 0) {
      throw new Error(
        `Invalid timeout. Must be an integer >= 0 and less than Number.MAX_SAFE_INTEGER, is "${timeout}".`
      );
    }

    /**
     * @property {string}
     * @protected
     * @name XHRConnection#method
     */
    Object.defineProperty(this, "method", { value: method });

    /**
     * @property {*}
     * @protected
     * @name XHRConnection#body
     */
    Object.defineProperty(this, "body", { value: body });

    /**
     * @property {object}
     * @protected
     * @name XHRConnection#headers
     */
    Object.defineProperty(this, "headers", { value: headers });

    /**
     * @property {string}
     * @protected
     * @name XHRConnection#responseType
     */
    Object.defineProperty(this, "responseType", { value: responseType });

    /**
     * @property {int}
     * @protected
     * @name XHRConnection#timeout
     */
    Object.defineProperty(this, "timeout", { value: timeout });

    /**
     * @property {XMLHttpRequest}
     * @protected
     * @name XHRConnection#xhr
     */
    Object.defineProperty(this, "xhr", { value: new XMLHttpRequest() });
  }

  get response() {
    /**
     * IE11 doesnt support responseType="json" correctly,
     * it will fall back to plain text, so we have to parse it.
     */
    if (
      this.responseType === "json" &&
      this.xhr.response &&
      this.xhr.responseType === ""
    ) {
      return JSON.parse(this.xhr.response);
    }

    return this.xhr.response;
  }

  get status() {
    return this.xhr.status;
  }

  /**
   * create, prepare, open and send the xhr request
   */
  open() {
    if (this.state !== XHRConnection.INIT) {
      return;
    }

    this.xhr.addEventListener("progress", () => {
      this.emit(
        ConnectionEvent.DATA,
        new ConnectionEvent(this, ConnectionEvent.DATA)
      );
    });

    this.xhr.addEventListener("load", () => {
      this.state = XHRConnection.CLOSED;

      if (this.status < 400) {
        this.emit(
          ConnectionEvent.COMPLETE,
          new ConnectionEvent(this, ConnectionEvent.COMPLETE)
        );

        return;
      }

      this.emit(
        ConnectionEvent.ERROR,
        new ConnectionEvent(this, ConnectionEvent.ERROR)
      );
    });

    this.xhr.addEventListener("abort", () => {
      this.state = XHRConnection.CLOSED;

      this.emit(
        ConnectionEvent.ABORT,
        new ConnectionEvent(this, ConnectionEvent.ABORT)
      );
    });

    this.xhr.addEventListener("error", () => {
      this.state = XHRConnection.CLOSED;

      this.emit(
        ConnectionEvent.ERROR,
        new ConnectionEvent(this, ConnectionEvent.ERROR)
      );
    });

    this.xhr.addEventListener("timeout", () => {
      this.state = XHRConnection.CLOSED;

      this.emit(
        ConnectionEvent.ERROR,
        new ConnectionEvent(this, ConnectionEvent.ERROR)
      );
    });

    this.xhr.open(this.method, this.url);
    this.xhr.timeout = this.timeout;
    this.state = XHRConnection.OPEN;
    this.emit(
      ConnectionEvent.OPEN,
      new ConnectionEvent(this, ConnectionEvent.OPEN)
    );

    Object.keys(this.headers).forEach(key => {
      if (this.headers[key] !== undefined && this.headers[key] !== null) {
        this.xhr.setRequestHeader(key, this.headers[key]);
      }
    });

    this.xhr.responseType = this.responseType;
    this.xhr.send(this.body);
  }

  /**
   * @description Close the connection and abort open requests
   */
  close() {
    if (this.state === XHRConnection.INIT) {
      this.state = XHRConnection.CLOSED;
    }

    if (this.state === XHRConnection.OPEN) {
      this.xhr.abort();
    }
  }
}
