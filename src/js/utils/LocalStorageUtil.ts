const LocalStorageUtil = {
  set(key: string, value: string) {
    return window.localStorage.setItem(key, value);
  },

  get(string: string): string {
    const item = window.localStorage.getItem(string);
    return typeof item === "string" ? item : "";
  },
};

export default LocalStorageUtil;
