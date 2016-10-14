class Action {
  constructor(path, value, type = 'SET') {
    Object.defineProperties(this, {
      path: {
        value: path,
        writable: false
      },
      value: {
        value,
        writable: false
      },
      type: {
        value: type,
        writable: false
      }
    });
  }

}

module.exports = Action;
