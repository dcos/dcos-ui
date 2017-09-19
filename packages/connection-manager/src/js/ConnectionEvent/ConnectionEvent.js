export default class ConnectionEvent {
  constructor(target, type) {
    Object.defineProperty(this, "target", {
      get: () => target
    });

    Object.defineProperty(this, "type", {
      get: () => type
    });

    const fired = Date.now();
    Object.defineProperty(this, "fired", {
      get: () => fired
    });
  }
  static get OPEN() {
    return Symbol.for("DCOS.ConnectionManager.ConnectionEvent.OPEN");
  }
  static get DATA() {
    return Symbol.for("DCOS.ConnectionManager.ConnectionEvent.DATA");
  }
  static get CLOSE() {
    return Symbol.for("DCOS.ConnectionManager.ConnectionEvent.CLOSE");
  }
  static get ERROR() {
    return Symbol.for("DCOS.ConnectionManager.ConnectionEvent.ERROR");
  }
  static get ABORT() {
    return Symbol.for("DCOS.ConnectionManager.ConnectionEvent.ABORT");
  }
}
