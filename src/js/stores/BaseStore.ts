import { EventEmitter } from "events";

type fn = (...args: any[]) => void;

class BaseStore extends EventEmitter {
  public addChangeListener(eventName: string, callback: fn) {
    this.on(eventName, callback);
  }

  public removeChangeListener(eventName: string, callback: fn) {
    this.removeListener(eventName, callback);
  }
}

export default BaseStore;
