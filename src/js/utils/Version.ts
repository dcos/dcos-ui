import compareVersions from "compare-versions";
import Service from "plugins/services/src/js/structs/Service";
import Pod from "plugins/services/src/js/structs/Pod";

type Version = string;

/**
 * Tell whether a string represents a semver version.
 */
const isSemver = (version: string) =>
  /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?)?)?$/i.test(
    version
  );

// Semvers first, string compare after
function compare(a: Version, b: Version) {
  if (isSemver(a) && isSemver(b)) {
    return compareVersions(a, b);
  }
  if (isSemver(a)) {
    return 1;
  }
  if (isSemver(b)) {
    return -1;
  }

  return a.localeCompare(b);
}

const fromService = (service: Service | Pod) => service.getVersion();

export { compare, fromService };
