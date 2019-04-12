import compareVersions from "compare-versions";
import sort from "array-sort";

import Framework from "../structs/Framework";
/* eslint-disable no-unused-vars */
import ServiceTree from "../structs/ServiceTree";
/* eslint-enable no-unused-vars */
import FrameworkUtil from "./FrameworkUtil";

/**
 * Get raw and display formatted service versions
 * @param {Service} service
 * @returns {object} object containing rawVersion and displayVersion
 */
function getFormattedVersion(service) {
  if (!service.getVersion || service.getVersion === "") {
    return null;
  }
  const rawVersion = service.getVersion();
  const displayVersion =
    service && service instanceof Framework
      ? FrameworkUtil.extractBaseTechVersion(rawVersion)
      : "";

  return { rawVersion, displayVersion };
}

/**
 * Validate whether a version string is semver formatteed
 * @param {string} version
 * @returns {boolean} true if "version" is semver formatted,
 * false otherwise.
 */
function validateSemver(version) {
  const semver = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?)?)?$/i;

  return semver.test(version);
}

/**
 * Compare dotted number strings
 * @param {string} a
 * @param {string} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function dottedNumberCompareFunction(a, b) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return -1;
  } else if (!b) {
    return 1;
  } else if (!validateSemver(a) && !validateSemver(b)) {
    return a.localeCompare(b);
  } else if (!validateSemver(a)) {
    return -1;
  } else if (!validateSemver(b)) {
    return 1;
  } else {
    return compareVersions(a, b);
  }
}

/**
 * Compare service version
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {Number} desc first
 */
function versionCompareFunction(a, b) {
  const aVersion = getFormattedVersion(a);
  const bVersion = getFormattedVersion(b);

  return dottedNumberCompareFunction(
    aVersion && aVersion.displayVersion,
    bVersion && bVersion.displayVersion
  );
}

function getCompareFunctionByProp(prop) {
  switch (prop) {
    case "name":
      return (a, b) => a.getName().localeCompare(b.getName());
    case "tasks":
      return (a, b) =>
        a.getTasksSummary().tasksRunning - b.getTasksSummary().tasksRunning;
    case "status":
      return (a, b) =>
        b.getServiceStatus().priority - a.getServiceStatus().priority;
    case "cpus":
      return (a, b) => a.getResources().cpus - b.getResources().cpus;
    case "gpus":
      return (a, b) => a.getResources().gpus - b.getResources().gpus;
    case "mem":
      return (a, b) => a.getResources().mem - b.getResources().mem;
    case "disk":
      return (a, b) => a.getResources().disk - b.getResources().disk;
    case "instances":
      return (a, b) => a.instances - b.instances;
    case "version":
      return versionCompareFunction;
    default:
      return () => 0;
  }
}

const ServiceTableUtil = {
  /**
   * Get service table prop compare functions
   * @param {array} data
   * @param {string} sortDirection
   * @param {string} prop
   * @returns {function} prop compare function
   */
  sortData(data, sortDirection, prop) {
    const compareFunction = getCompareFunctionByProp(prop);
    const comparators = [compareFunction];
    const reverse = sortDirection !== "ASC";

    return sort(data, comparators, { reverse });
  },

  getFormattedVersion
};

module.exports = ServiceTableUtil;
