// import OriginalAbstractConnection from "../AbstractConnection";
const OriginalAbstractConnection = require.requireActual(
  "../AbstractConnection"
).default;
// const OriginalAbstractConnection = require("../AbstractConnection");

const AbstractConnection = jest.fn();

AbstractConnection.INIT = OriginalAbstractConnection.INIT;
AbstractConnection.STARTED = OriginalAbstractConnection.STARTED;
AbstractConnection.CLOSED = OriginalAbstractConnection.CLOSED;
AbstractConnection.CANCELLED = OriginalAbstractConnection.CANCELLED;

AbstractConnection.prototype.open = jest.fn(function() {
  this.state = AbstractConnection.STARTED;
});
AbstractConnection.prototype.close = jest.fn();
AbstractConnection.prototype.reset = jest.fn();
AbstractConnection.prototype.on = jest.fn();
AbstractConnection.prototype.listeners = jest.fn(() => []);
AbstractConnection.prototype.state = AbstractConnection.INIT;

export default AbstractConnection;

console.log("mocking AbstractConnection");
