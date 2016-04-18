var LocalStorageUtil = {
  set: function () {
    return global.localStorage.setItem.apply(global.localStorage, arguments);
  },

  get: function () {
    return global.localStorage.getItem.apply(global.localStorage, arguments);
  }
};

module.exports = LocalStorageUtil;
