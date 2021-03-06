function resourceLimitReducer(resourceField: string, parseFn = parseInt) {
  return function (
    this: { cache?: number | string | null },
    state: string | number | null,
    args: { path: string; value: number | boolean | "unlimited" | null } = {
      path: "",
      value: null,
    }
  ) {
    const { path, value } = args;
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
    let numberValue: number | null = unlimited ? this.cache : parseFn(value);
    // restore the cached value when deselecting unlimited
    numberValue = value === false ? this.cache : numberValue;
    numberValue = isNaN(numberValue) ? null : numberValue;

    // if the value is not a number we return either null or `"unlimited"`.
    // This is necessary to since the type is `number | "unlimited"`
    // if the value is a `false` this means that unlimited was disabled and we use the old
    // number from the cache. This is a toggle functionality.
    if (typeof value === "boolean" || value === "unlimited") {
      return value === false ? this.cache || null : "unlimited";
    }

    // If the value is a number which cache it and return the cache.
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
    { path, value },
  ]);
  const mem = resourceLimitReducer("mem", parseInt).apply(this.mem, [
    state.mem,
    { path, value },
  ]);
  return {
    cpus,
    mem,
  };
}
