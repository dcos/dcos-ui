var PodUtil = {
  isContainerMatchingText(container, text) {
    if (!text) {
      return true;
    }

    return container.getName().indexOf(text) >= 0;
  },

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
