import { EventEmitter } from "events";

class BaseStore extends EventEmitter {
  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }
}

export default BaseStore;
