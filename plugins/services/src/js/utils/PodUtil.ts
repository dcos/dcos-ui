import PodInstance from "../structs/PodInstance";
import PodInstanceList from "../structs/PodInstanceList";

const PodUtil = {
  /**
   * Returns true if the container given matches
   * the free-text given.
   *
   * @param {PodContainer} container - The Container to test
   * @param {string} text - The text to test against
   * @returns {boolean} - Returns true if the test passes
   */
  isContainerMatchingText(container, text) {
    return !text ? true : container.getName().indexOf(text) >= 0;
  },

  /**
   * Returns true if the container instance matches
   * the free-text given.
   *
   * @param {PodInstance} instance - The instance to test
   * @param {string} text - The text to test against
   * @returns {boolean} - Returns true if the test passes
   */
  isInstanceOrChildrenMatchingText(instance, text) {
    return !text || instance.getName().indexOf(text) >= 0
      ? true
      : instance
          .getContainers()
          .some((container) =>
            PodUtil.isContainerMatchingText(container, text)
          );
  },

  /**
   * This function merges the output of MesosStateUtil.getPodHistoricalInstances
   * with the array of currently known instances returned from the
   * Pod.getInstances() function.
   *
   * NOTE: podInstances is an array of PodInstance objects, but the
   *       historicalInstances is an array of plain objects, with a structure
   *       that can be used to construct a PodInstance!
   *
   * @param {PodInstanceList} podInstances - An array of PodInstance objects
   * @param {Array} historicalInstances - The output of
   *  getPodHistoricalInstances
   * @returns {PodInstanceList} The new array of PodInstance objects
   */
  mergeHistoricalInstanceList(podInstances, historicalInstances) {
    if (!historicalInstances) {
      return podInstances;
    }

    // De-compose PodInstances into plain objects, so we always operate
    // with plain objects
    const podInstancesMap = podInstances.reduceItems((memo, podInstance) => {
      memo[podInstance.getId()] = podInstance.get();
      return memo;
    }, {});

    // Then merge historical instance information in the pod instance map
    const combinedInstanceMap = historicalInstances.reduce(
      (memo, historicalInstance) => {
        const podInstance = memo[historicalInstance.id];
        if (podInstance === undefined) {
          memo[historicalInstance.id] = historicalInstance;

          return memo;
        }

        let combinedContainers = [].concat(
          podInstance.containers,
          historicalInstance.containers.map((container) => ({
            ...container,
            isHistoricalInstance: true,
          }))
        );

        // Filter combined container list to remove potential duplicates
        const containerIds = new Map();
        combinedContainers = combinedContainers.filter((container) => {
          if (
            container.containerId != null &&
            !containerIds.has(container.containerId)
          ) {
            containerIds.set(container.containerId);

            return true;
          }

          return false;
        });

        podInstance.containers = combinedContainers;

        return memo;
      },
      podInstancesMap
    );

    // Re-compose PodInstances from plain objects
    const instances = Object.values(combinedInstanceMap).map(
      (instance) => new PodInstance(instance)
    );

    return new PodInstanceList({ items: instances });
  },

  getInstanceIdFromTaskId(taskId) {
    return taskId.split(".").slice(0, 2).join(".");
  },
};

export default PodUtil;
