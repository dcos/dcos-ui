import { isCallable } from "./ValidatorUtil";

export default function pipe(...callables) {
  if (!callables.every(isCallable)) {
    throw new Error("All callables should implement a callable interface!");
  }

  return function(state, ...rest) {
    return callables.reduce(function(acc, callable) {
      return callable.call(callable, acc, ...rest);
    }, state);
  };
}
