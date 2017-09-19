import {
  default as ConnectionManagerClass
} from "./src/js/ConnectionManager/ConnectionManager";
import XHRConnection from "./src/js/Connection/XHRConnection";
import AbstractConnection from "./src/js/Connection/AbstractConnection";
import * as EventTypes from "./src/js/Connection/EventTypes";
import * as StateConstants from "./src/js/Connection/StateConstants";

const ConnectionManager = new ConnectionManagerClass();

export default ConnectionManager;
export { AbstractConnection, EventTypes, StateConstants, XHRConnection };
