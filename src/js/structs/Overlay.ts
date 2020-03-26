export type APIResponse = {
  readonly enabled?: boolean;
  readonly name?: string;
  readonly prefix?: number;
  readonly prefix6?: string;
  readonly subnet?: string;
  readonly subnet6?: string;
};

export type Overlay = {
  readonly enabled?: boolean;
  readonly name?: string;
  readonly prefix?: number;
  readonly prefix6?: string;
  readonly subnet?: string;
  readonly subnet6?: string;
};

export const Overlay = {
  from: (r: APIResponse): Overlay => ({
    enabled: r.enabled,
    name: r.name,
    prefix: r.prefix,
    prefix6: r.prefix6,
    subnet: r.subnet,
    subnet6: r.subnet6,
  }),
};
