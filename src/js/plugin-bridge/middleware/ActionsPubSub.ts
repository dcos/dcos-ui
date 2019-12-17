const listeners = {};
let ID = 0;

const pub = () => next => action => {
  Object.keys(listeners).forEach(id => {
    listeners[id].call(null, action);
  });

  return next(action);
};

const unsubscribe = id => () => {
  delete listeners[id];
};

const sub = callback => {
  listeners[++ID] = callback;

  return unsubscribe(ID);
};

export default {
  pub,
  sub
};
