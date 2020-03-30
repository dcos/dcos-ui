const resourceLimitReducer = (resourceField: string, parseFn = parseInt) => {
  return (state: { value: number; unlimited: boolean }, { path, value }) => {
    // The following line is extracting the third last element of a path or the second last.
    // The path can be one of the following `*.limits.cpus` or `*.limits.cpus.unlimited`
    // so limit is becoming in an ideal case `limits` and resource is becoming `cpus`
    const [limit, resource] =
      path.slice(-3)[0] === "limits" ? path.slice(-3) : path.slice(-2);
    const numberValue = parseFn(value);

    // if the fields are not what we are looking for exit early.
    if (limit !== "limits" || resourceField !== resource) {
      return state;
    }
    // if the value is a number (not NaN) we return the new value and unlimited false.
    return !isNaN(numberValue)
      ? { value: numberValue, unlimited: false }
      : // if the value is NaN it is either a bool or a string containing `unlimited` in that
        // in that case we do return the old nummeric value and set unlimited to a boolean.
        {
          value: state?.value || null,
          unlimited: value === "unlimited" || value === true,
        };
  };
};

export { resourceLimitReducer };
