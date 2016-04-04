import HealthSorting from '../constants/HealthSorting';

class ServiceTableUtil {

  /**
   * Create service table prop compare functions
   * @param {string} prop
   * @returns {function} prop compare function
   */
  static propCompareFunctionFactory(prop) {
    switch (prop) {
      case 'name':
        return ServiceTableUtil.nameCompareFunction;
      case 'tasks':
        return ServiceTableUtil.taskCompareFunction;
      case 'health':
        return ServiceTableUtil.healthCompareFunction;
      case 'cpus':
        return ServiceTableUtil.cpusCompareFunction;
      case 'mem':
        return ServiceTableUtil.memCompareFunction;
      case 'disk':
        return ServiceTableUtil.diskCompareFunction;
      default:
        return function () {
          return 0;
        };
    }
  }

  /**
   * Compare number values
   * @param {number} a
   * @param {number} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static numberCompareFunction(a, b) {
    let delta = a - b;
    return (delta) / Math.abs(delta || 1);
  }

  /**
   * Compare service names
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static nameCompareFunction(a, b) {
    return a.getName().localeCompare(b.getName());
  }

  /**
   * Compare number of running tasks
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static taskCompareFunction(a, b) {
    return ServiceTableUtil.numberCompareFunction(
      a.getTasksSummary().tasksRunning,
      b.getTasksSummary().tasksRunning
    );
  }

  /**
   * Compare service health
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static healthCompareFunction(a, b) {
    return ServiceTableUtil.numberCompareFunction(
      HealthSorting[a.getHealth().key],
      HealthSorting[b.getHealth().key]
    );
  }

  /**
   * Compare service cpus
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static cpusCompareFunction(a, b) {
    return ServiceTableUtil.numberCompareFunction(
      a.getResources().cpus,
      b.getResources().cpus
    );
  }

  /**
   * Compare service memory
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static memCompareFunction(a, b) {
    return ServiceTableUtil.numberCompareFunction(
      a.getResources().mem,
      b.getResources().mem
    );
  }

  /**
   * Compare service disk
   * @param {Service} a
   * @param {Service} b
   * @returns {number} a number indicating whether "a" comes before or after or
   * is the same as "b" in sort order.
   */
  static diskCompareFunction(a, b) {
    return ServiceTableUtil.numberCompareFunction(
      a.getResources().disk,
      b.getResources().disk
    );
  }

}

module.exports = ServiceTableUtil;
