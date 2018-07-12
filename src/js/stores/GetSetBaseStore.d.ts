import BaseStore from "./BaseStore";

export default class GetSetBaseStore extends BaseStore {
  get: (key: string) => null | object;
  set: (data: object) => void;
}
