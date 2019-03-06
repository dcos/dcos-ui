const stringToBool = (s: string) => {
  switch (s.toLowerCase()) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`can't convert ${s} to boolean`);
  }
};

export { stringToBool };
