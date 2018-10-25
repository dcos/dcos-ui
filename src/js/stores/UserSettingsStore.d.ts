import EventEmitter from "events";

export default class UserSettingsStore extends EventEmitter {
  static getKey: (key: any) => any;
  static setKey: (key: string, value: any) => null | object;
}
