var PodUtil = {

  /**
   * Returns true if the container given matches
   * the free-text given.
   *
   * @param {PodContainer} container - The Container to test
   * @param {string} text - The text to test against
   * @returns {boolean} - Returns true if the test passes
   */
  isContainerMatchingText(container, text) {
    if (!text) {
      return true;
    }

    return container.getName().indexOf(text) >= 0;
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
    if (!text) {
      return true;
    }

    if (instance.getName().indexOf(text) >= 0) {
      return true;
    }

    return instance.getContainers().some(function (container) {
      return PodUtil.isContainerMatchingText(container, text);
    });
  }
};

module.exports = PodUtil;
