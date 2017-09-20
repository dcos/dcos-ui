const OriginalAbstractConnection = require.requireActual(
  "../AbstractConnection"
).default;

const AbstractConnection = function() {
  this.url = null;
  this.state = OriginalAbstractConnection.INIT;
  this.open = jest.fn(() => {
    this.state = OriginalAbstractConnection.OPEN;
  });
  this.close = jest.fn(() => {
    this.state = OriginalAbstractConnection.CLOSED;
  });
  this.on = jest.fn();
  this.addListener = jest.fn();
  this.removeListener = jest.fn();
  this.listeners = jest.fn(() => []);
};

AbstractConnection.INIT = OriginalAbstractConnection.INIT;
AbstractConnection.OPEN = OriginalAbstractConnection.OPEN;
AbstractConnection.CLOSED = OriginalAbstractConnection.CLOSED;

export default AbstractConnection;
