import { EventEmitter } from "events";

class BaseStore extends EventEmitter {
  public addChangeListener(
    eventName: string,
    callback: (...args: any[]) => void
  ) {
    this.on(eventName, callback);
  }

  public removeChangeListener(
    eventName: string,
    callback: (...args: any[]) => void
  ) {
    this.removeListener(eventName, callback);
  }
}

export default BaseStore;
