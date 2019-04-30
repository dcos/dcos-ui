import { EventEmitter } from "events";

export default class BaseStore extends EventEmitter {
  addChangeListener: (eventName: string, callback: (...any) => any) => void;
  removeChangeListener: (eventName: string, callback: (...any) => any) => void;
}
