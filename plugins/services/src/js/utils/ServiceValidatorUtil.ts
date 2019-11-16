const ServiceValidatorUtil = {
  /**
   * Checks if the given server response is a Pod
   *
   * @param {object} data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isPodResponse(data: { spec?: { containers?: unknown[] } }): boolean {
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
  isPodSpecDefinition(data: { containers?: unknown[] }): boolean {
    return Array.isArray(data.containers);
  },

  /**
   * Checks if the given server response is an application
   *
   * @param {object} _data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isApplicationResponse(_data: unknown): boolean {
    // TODO: Check how an application can be cleanly identified (DCOS-9618)
    return true;
  },

  /**
   * Checks if the given server response is a framework
   *
   * @param {object} data - The server response
   * @returns {boolean} - True if the response refers to a pod
   */
  isFrameworkResponse(data: any): boolean {
    // Check the DCOS_PACKAGE_FRAMEWORK_NAME label to determine if the item
    // should be converted to an Application or Framework instance.
    return (
      ServiceValidatorUtil.isApplicationResponse(data) &&
      data.labels &&
      data.labels.DCOS_PACKAGE_FRAMEWORK_NAME
    );
  },

  isValidGroupID(groupID: string | unknown): boolean {
    if (typeof groupID !== "string" || groupID === "") {
      return false;
    }

    // This RegExp is taken from the ID field explanation described here:
    // https://mesosphere.github.io/marathon/docs/rest-api.html#post-v2-apps
    const groupIDSegmentPattern = new RegExp(
      "^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])[.])" +
        "*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$"
    );

    return groupID
      .split("/")
      .every(
        (segment, index) =>
          index === 0 &&
          !(segment === null || segment === "" || segment === ".") &&
          segment !== "." &&
          segment !== ".." &&
          groupIDSegmentPattern.test(segment)
      );
  }
};

export default ServiceValidatorUtil;
