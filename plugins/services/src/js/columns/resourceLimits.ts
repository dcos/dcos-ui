import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import Application from "../structs/Application";

type TreeItem = Application | Service | Pod | ServiceTree;
type ResourceLimit = number | "unlimited" | undefined;
export type ResourceLimits = { cpus: ResourceLimit; mem: ResourceLimit };

export const getResourceLimits = (
  treeItem: TreeItem,
  multiplyScale = false
): ResourceLimits => {
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
        const resources = container.resources;
        acc.cpus = addResourceLimit(acc.cpus, cpus || resources?.cpus);
        acc.mem = addResourceLimit(acc.mem, mem || resources?.mem);
        return acc;
      },
      { cpus: undefined, mem: undefined, ...treeItem.spec.executorResources }
    );
    return multiplyScale ? multInstances(limits, instances) : limits;
  }
  if (treeItem instanceof Service) {
    const limits = getLimits(treeItem);
    return multiplyScale ? multInstances(limits, instances) : limits;
  }
  throw Error(
    `could not get resource limits for unexpected row in table: ${treeItem}`
  );
};

const getLimits = (thing) => {
  return { cpus: thing.resourceLimits?.cpus, mem: thing.resourceLimits?.mem };
};

const multInstances = (limits, instances) => ({
  cpus: multResourceLimit(limits.cpus, instances),
  mem: multResourceLimit(limits.mem, instances),
});

// when one is "unlimited", return unlimited
// when both are undefined, return undefined
// else add with converting undefined to 0.
const addResourceLimit = (a: ResourceLimit, b: ResourceLimit) =>
  a === "unlimited" || b === "unlimited"
    ? "unlimited"
    : a === undefined && b === undefined
    ? undefined
    : (a || 0) + (b || 0);

const multResourceLimit = (rl: ResourceLimit, mult: number) =>
  rl === undefined || rl === "unlimited" ? rl : rl * mult;
