const listeners = {};
let ID = 0;

const pub = function() {
  return function(next) {
    return function(action) {
      Object.keys(listeners).forEach(function(id) {
        listeners[id].call(null, action);
      });

      return next(action);
    };
  };
};

const unsubscribe = function(id) {
  return function() {
    delete listeners[id];
  };
};

const sub = function(callback) {
  listeners[++ID] = callback;

  return unsubscribe(ID);
};

module.exports = {
  pub,
  sub
};
