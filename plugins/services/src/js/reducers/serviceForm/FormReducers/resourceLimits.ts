const resourceLimitReducer = (resourceField: string, parseFn = parseInt) => {
  return (state: { value: number; unlimited: boolean }, { path, value }) => {
    const [limit, resource] =
      path.slice(-3)[0] === "limits" ? path.slice(-3) : path.slice(-2);

    if (limit === "limits" && resourceField === resource) {
      if (value === "unlimited" || value === true) {
        return { ...state, unlimited: true };
      }
      if (value === false) {
        return { ...state, unlimited: false };
      }
      return { value: parseFn(value), unlimited: false };
    }
    return state;
  };
};

export { resourceLimitReducer };
