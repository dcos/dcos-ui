const listeners = {};
let ID = 0;

const pub = () => {
  return next => {
    return action => {
      Object.keys(listeners).forEach(id => {
        listeners[id].call(null, action);
      });

      return next(action);
    };
  };
};

const unsubscribe = id => {
  return () => {
    delete listeners[id];
  };
};

const sub = callback => {
  listeners[++ID] = callback;

  return unsubscribe(ID);
};

module.exports = {
  pub,
  sub
};
