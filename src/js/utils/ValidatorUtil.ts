export function isDefined(value?) {
  return (value != null && value !== "") || typeof value === "number";
}

export function isEmpty(data?) {
  if (typeof data === "number" || typeof data === "boolean") {
    return false;
  }

  if (typeof data === "undefined" || data === null) {
    return true;
  }

  if (typeof data.length !== "undefined") {
    return data.length === 0;
  }

  return (
    Object.keys(data).reduce((memo, key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        memo++;
      }

      return memo;
    }, 0) === 0
  );
}

export function isInteger(value) {
  return isNumber(value) && Number.isInteger(parseFloat(value));
}

export function isNumber(value) {
  const number = parseFloat(value);

  return (
    /^[0-9e+-.,]+$/.test(value) &&
    !Number.isNaN(number) &&
    Number.isFinite(number)
  );
}

export function isNumberInRange(value, range = {}) {
  const { min = 0, max = Number.POSITIVE_INFINITY } = range;
  const number = parseFloat(value);

  return isNumber(value) && number >= min && number <= max;
}

export function isStringInteger(value) {
  return typeof value === "string" && /^([0-9]+)$/.test(value);
}
