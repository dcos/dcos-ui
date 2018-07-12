import GetSetBaseStore from "./GetSetBaseStore";

export default class AuthStore extends GetSetBaseStore {
  constructor();
  static login: () => void;
  static logout(): void;
  static isLoggedIn: () => boolean;
  static getUser: () => null | object;
  static getUserLabel: () => null | string;
  processLoginSuccess: () => void;
  processLogoutSuccess: () => void;
  static storeID: () => string;
}
