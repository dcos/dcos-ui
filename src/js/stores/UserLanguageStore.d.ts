import { EventEmitter } from "events";

declare class UserLanguageStore extends EventEmitter {
  get(): string;
  set(language: string): void;
}

export default UserLanguageStore.Instance;
