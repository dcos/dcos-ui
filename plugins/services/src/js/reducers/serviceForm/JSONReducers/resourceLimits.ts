function resourceLimitReducer(resourceField: string, parseFn = parseInt) {
  return function(
    this: { cache?: number | string },
    state: string | number | null,
    args: { path: string; value: any } = { path: "", value: null }
  ) {
    const { path, value } = args;
    const [limit, resource] =
      path.slice(-3)[0] === "limits" ? path.slice(-3) : path.slice(-2);
    const numberValue = parseFn(value);
    if (limit !== "limits" || resourceField !== resource) {
      return state;
    }
    if (isNaN(numberValue)) {
      return value === false
        ? this.cache || null
        : (value === "unlimited" || value === true) && "unlimited";
    }
    this.cache = numberValue;
    return this.cache;
  };
}

export function JSONReducer(
  this: {
    mem: { cache?: number | string };
    cpu: { cache?: number | string };
  },
  state = { cpus: null, mem: null },
  { path, value }
) {
  this.mem = this.mem == null ? {} : this.mem;
  this.cpu = this.cpu == null ? {} : this.cpu;
  const cpus = resourceLimitReducer("cpus", parseFloat).apply(this.cpu, [
    state.cpus,
    { path, value }
  ]);
  const mem = resourceLimitReducer("mem", parseInt).apply(this.mem, [
    state.mem,
    { path, value }
  ]);
  return {
    cpus,
    mem
  };
}
