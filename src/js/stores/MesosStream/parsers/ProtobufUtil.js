export function isScalar(value) {
  return Boolean(value && Object.prototype.hasOwnProperty.call(value, "value"));
}

export function scalar(scalar) {
  if (!isScalar(scalar)) {
    //quickfix for my scalar message issue
    return scalar;
    // throw new Error(`Expect value to be a scalar, "${typeof scalar}" given.`);
  }

  return scalar.value;
}
