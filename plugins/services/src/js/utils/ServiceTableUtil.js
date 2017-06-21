import HealthSorting from "../constants/HealthSorting";
import ServiceTree from "../structs/ServiceTree";

/**
 * Compare number values
 * @param {number} a
 * @param {number} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function numberCompareFunction(a, b) {
  const delta = a - b;

  return delta / Math.abs(delta || 1);
}

/**
 * Compare service names
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function nameCompareFunction(a, b) {
  return a.getName().localeCompare(b.getName());
}

/**
 * Compare number of running tasks
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function taskCompareFunction(a, b) {
  return numberCompareFunction(
    a.getTasksSummary().tasksRunning,
    b.getTasksSummary().tasksRunning
  );
}

/**
 * Compare service health
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function healthCompareFunction(a, b) {
  return numberCompareFunction(
    HealthSorting[a.getHealth().key],
    HealthSorting[b.getHealth().key]
  );
}

/**
 * Compare service cpus
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function cpusCompareFunction(a, b) {
  return numberCompareFunction(a.getResources().cpus, b.getResources().cpus);
}

/**
 * Compare service memory
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function memCompareFunction(a, b) {
  return numberCompareFunction(a.getResources().mem, b.getResources().mem);
}

/**
 * Compare service disk
 * @param {Service|ServiceTree} a
 * @param {Service|ServiceTree} b
 * @returns {number} a number indicating whether "a" comes before or after or
 * is the same as "b" in sort order.
 */
function diskCompareFunction(a, b) {
  return numberCompareFunction(a.getResources().disk, b.getResources().disk);
}

/**
 * Get service table prop compare functions
 * @param {string} prop
 * @returns {function} prop compare function
 */
function getCompareFunctionByProp(prop) {
  switch (prop) {
    case "name":
      return nameCompareFunction;
    case "tasks":
      return taskCompareFunction;
    case "status":
      return healthCompareFunction;
    case "cpus":
      return cpusCompareFunction;
    case "mem":
      return memCompareFunction;
    case "disk":
      return diskCompareFunction;
    default:
      return function() {
        return 0;
      };
  }
}

const ServiceTableUtil = {
  /**
   * Create service table prop compare functions
   * @param {string} prop
   * @param {string} [direction]
   * @returns {function} prop compare function
   */
  propCompareFunctionFactory(prop, direction) {
    const compareFunction = getCompareFunctionByProp(prop);
    let score = 1;

    if (direction === "desc") {
      score = -1;
    }

    return function(a, b) {
      // Hoist service trees to the top
      if (a instanceof ServiceTree && !(b instanceof ServiceTree)) {
        return score * -1;
      } else if (b instanceof ServiceTree && !(a instanceof ServiceTree)) {
        return score;
      }

      return compareFunction(a, b);
    };
  }
};

module.exports = ServiceTableUtil;
