const resourceLimitReducer = (resourceField: string, parseFn = parseInt) => {
  return (state: { value: number; unlimited: boolean }, { path, value }) => {
    const [limit, resource] =
      path.slice(-3)[0] === "limits" ? path.slice(-3) : path.slice(-2);
    const numberValue = parseFn(value);

    if (limit !== "limits" || resourceField !== resource) {
      return state;
    }
    return !isNaN(numberValue)
      ? { value: numberValue, unlimited: false }
      : {
          value: state?.value || null,
          unlimited: value === "unlimited" || value === true
        };
  };
};

export { resourceLimitReducer };
