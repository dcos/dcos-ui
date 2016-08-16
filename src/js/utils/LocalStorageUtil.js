var LocalStorageUtil = {
  set() {
    return global.localStorage.setItem.apply(global.localStorage, arguments);
  },

  get() {
    return global.localStorage.getItem.apply(global.localStorage, arguments);
  }
};

module.exports = LocalStorageUtil;
