import { EventEmitter } from "events";

export default class BaseStore extends EventEmitter {
  addChangeListener: (eventName: string, callback: () => void) => void;
  removeChangeListener: (eventName: string, callback: () => void) => void;
}
