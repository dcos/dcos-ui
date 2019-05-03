import { EventEmitter } from "events";

class BaseStore extends EventEmitter {
  addChangeListener(eventName: string, callback: (...args: any[]) => void) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName: string, callback: (...args: any[]) => void) {
    this.removeListener(eventName, callback);
  }
}

export default BaseStore;
