const resourceLimitReducer = (resourceField: string, parseFn = parseInt) => {
  return (state: { value: number; unlimited: boolean }, { path, value }) => {
    // The following line is extracting the third last element of a path or the second last.
    // The path can be one of the following `*.limits.cpus` or `*.limits.cpus.unlimited`
    // so limit is becoming in an ideal case `limits` and resource is becoming `cpus`
    const [limit, resource] =
      path.slice(-3)[0] === "limits" ? path.slice(-3) : path.slice(-2);

    // if the fields are not what we are looking for exit early.
    if (limit !== "limits" || resourceField !== resource) {
      return state;
    }

    const unlimited = value === "unlimited" || value === true;
    // display the cached value if unlimited was selected in the meantime
    let numberValue: number | null = unlimited ? state?.value : parseFn(value);
    // restore the cached value when deselecting unlimited
    numberValue = value === false ? state?.value : numberValue;
    numberValue = isNaN(numberValue) ? null : numberValue;

    // if the value is a number (not NaN) we return the new value and unlimited false.
    return { value: numberValue, unlimited };
  };
};

export { resourceLimitReducer };
