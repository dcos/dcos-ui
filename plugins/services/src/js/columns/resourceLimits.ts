import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

type TreeItem = Service | Pod | ServiceTree;
type ResourceLimit = number | "unlimited";
type ResourceLimits = { cpus: ResourceLimit; mem: ResourceLimit };

export const getResourceLimits = (treeItem: TreeItem): ResourceLimits => {
  if (treeItem instanceof ServiceTree) {
    return treeItem.reduceItems(
      (acc: ResourceLimits, item: TreeItem) => {
        const { cpus, mem } = getResourceLimits(item);
        acc.cpus = addResourceLimit(cpus, acc.cpus);
        acc.mem = addResourceLimit(mem, acc.mem);
        return acc;
      },
      { cpus: 0, mem: 0 }
    );
  }

  const instances = treeItem.getInstancesCount();
  if (treeItem instanceof Pod) {
    const limits = treeItem.spec.containers.reduce(
      (acc: ResourceLimits, container) => {
        const { cpus, mem } = getLimits(container);
        acc.cpus = addResourceLimit(acc.cpus, cpus);
        acc.mem = addResourceLimit(acc.mem, mem);
        return acc;
      },
      { cpus: 0, mem: 0, ...treeItem.spec.executorResources }
    );
    return multInstances(limits, instances);
  }
  if (treeItem instanceof Service) {
    return multInstances(getLimits(treeItem), instances);
  }
  throw Error(
    `could not get resource limits for unexpected row in table: ${treeItem}`
  );
};

// TODO: type thing. it's currently either a Service or a Pod.spec.containers[]
// we currently fall back to using the allocated resources as the limit in
// case a limit is not set until marathon gives us the correct limits according to whether cGroups are shared or not.
const getLimits = (thing) => {
  const { cpus = 0, mem = 0 } = thing.getResources?.() || thing.resources;
  return {
    cpus: thing.resourceLimits?.cpus ?? cpus,
    mem: thing.resourceLimits?.mem ?? mem,
  };
};

const multInstances = (limits, instances) => ({
  cpus: multResourceLimit(limits.cpus, instances),
  mem: multResourceLimit(limits.mem, instances),
});

const addResourceLimit = (a: ResourceLimit, b: ResourceLimit) =>
  a === "unlimited" || b === "unlimited" ? "unlimited" : a + b;

const multResourceLimit = (rl: ResourceLimit, mult: number) =>
  rl === "unlimited" ? rl : rl * mult;
