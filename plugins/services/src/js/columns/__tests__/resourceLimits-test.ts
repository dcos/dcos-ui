import { getResourceLimits, ResourceLimits } from "../resourceLimits";
import Application from "../../structs/Application";
import Pod from "../../structs/Pod";

const app = (
  resourceLimits: ResourceLimits = { cpus: 1, mem: 256 },
  instances = 2
) => new Application({ instances, resourceLimits });

const podContainer = (opts: any = {}) => ({
  resourceLimits: { cpus: 1, mem: 256 },
  ...opts,
});

// opts is passed to the second container
const pod = (opts: any[] = []) =>
  new Pod({
    spec: {
      containers: [podContainer(opts[0]), podContainer(opts[1])],
      scaling: { instances: 2 },
    },
  });

describe("getResourceLimits for apps", () => {
  it("does not incorporate scale by default", () => {
    expect(getResourceLimits(app())).toEqual({
      cpus: 1,
      mem: 256,
    });
  });
  it("can compute scaled values", () => {
    expect(getResourceLimits(app(), true)).toEqual({
      cpus: 2,
      mem: 512,
    });
  });
  it("returns null when no resourceLimits are set", () => {
    expect(
      getResourceLimits(app({ cpus: undefined, mem: undefined }), true)
    ).toEqual({
      cpus: undefined,
      mem: undefined,
    });
  });
});

describe("getResourceLimits for pods", () => {
  it("computes something sensible ", () => {
    expect(getResourceLimits(pod())).toEqual({
      cpus: 2,
      mem: 512,
    });
  });
  it("can compute scaled values", () => {
    expect(getResourceLimits(pod(), true)).toEqual({
      cpus: 4,
      mem: 1024,
    });
  });
  it("incorporates resources when calculating limits", () => {
    expect(
      getResourceLimits(
        pod([
          { resources: { mem: 128 }, resourceLimits: { mem: 256 } },
          { resources: { mem: 128 }, resourceLimits: { mem: undefined } },
        ])
      )
    ).toEqual({ cpus: undefined, mem: 384 });
  });
  it("incorporates resources when calculating limits", () => {
    expect(
      getResourceLimits(
        pod([
          { resources: { mem: 128 }, resourceLimits: { mem: 256 } },
          { resources: { mem: 128 }, resourceLimits: { mem: undefined } },
        ]),
        true
      )
    ).toEqual({ cpus: undefined, mem: 768 });
  });
});
