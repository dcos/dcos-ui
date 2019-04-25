import compareVersions from "compare-versions";

// @ts-ignore
import Framework from "../structs/Framework";
import Service from "../structs/Service";
import Pod from "../structs/Pod";
// @ts-ignore
import FrameworkUtil from "./FrameworkUtil";

type Version = string;

/**
 * Tell whether a version string is semver formatted
 * @param {string} version
 * @returns {boolean} true if "version" is semver formatted,
 * false otherwise.
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

const toDisplayVersion = (v: Version) =>
  FrameworkUtil.extractBaseTechVersion(v);

export { compare, fromService, toDisplayVersion };
