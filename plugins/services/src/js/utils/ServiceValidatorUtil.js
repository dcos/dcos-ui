const ServiceValidatorUtil = {
  isValidServiceID(serviceID) {
    if (typeof serviceID !== "string" || serviceID === "") {
      return false;
    }

    // This RegExp is taken from the ID field explanation described here:
    // https://mesosphere.github.io/marathon/docs/rest-api.html#post-v2-apps
    const serviceIDSegmentPattern = new RegExp(
      "^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])[.])" +
        "*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$"
    );

    return serviceID.split("/").every(function(segment, index) {
      return (
        (index === 0 && (segment == null || segment === "")) ||
        segment === "." ||
        segment === ".." ||
        serviceIDSegmentPattern.test(segment)
      );
    });
  },

  /**
   * Checks if the given server response is a Pod
   *
   * @param {object} data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isPodResponse(data) {
    return (
      typeof data.spec === "object" &&
      ServiceValidatorUtil.isPodSpecDefinition(data.spec)
    );
  },

  /**
   * Checks if the given definition (commonly form the ServiceForm)
   * is a Pod specification.
   *
   * @param {object} data - The definition
   * @returns {boolean} - True if the response refers to a pod
   */
  isPodSpecDefinition(data) {
    return Array.isArray(data.containers);
  },

  /**
   * Checks if the given server response is an application
   *
   * @param {object} data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isApplicationResponse() {
    // TODO: Check how an application can be cleanly identified (DCOS-9618)
    return true;
  },

  // Applications and frameworks have no different semantics
  // between their spec and their server response.
  isApplicationSpecDefinition(data) {
    return ServiceValidatorUtil.isApplicationResponse(data);
  },

  /**
   * Checks if the given server response is a framework
   *
   * @param {object} data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isFrameworkResponse(data) {
    // Check the DCOS_PACKAGE_FRAMEWORK_NAME label to determine if the item
    // should be converted to an Application or Framework instance.
    return (
      ServiceValidatorUtil.isApplicationResponse(data) &&
      data.labels &&
      data.labels.DCOS_PACKAGE_FRAMEWORK_NAME
    );
  },

  // Applications and frameworks have no different semantics
  // between their spec and their server response.
  isFrameworkSpecDefinition(data) {
    return ServiceValidatorUtil.isFrameworkResponse(data);
  }
};

module.exports = ServiceValidatorUtil;
