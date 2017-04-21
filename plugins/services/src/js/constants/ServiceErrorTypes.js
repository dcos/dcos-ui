const ServiceErrorTypes = {
  /**
   * A generic type of error without any detailed information
   */
  GENERIC: "GENERIC",

  /**
   * Two or more properties are present in the configuration that are are
   * conflicting to eachother.
   *
   * Expected variables:
   * {
   *   "feature1": "first conflicting feature",
   *   "feature2": "second conflicting feature"
   * }
   */
  PROP_CONFLICT: "PROP_CONFLICT",

  /**
   * The specified property is part of a deprecated API
   *
   * Expected variables:
   * {
   *   "name": "property name"
   * }
   */
  PROP_DEPRECATED: "PROP_DEPRECATED",

  /**
   * All of the specified properties must be specified
   *
   * Expected variables:
   * {
   *    "names": "prop1, prop2, prop3, ..."
   * }
   */
  PROP_MISSING_ALL: "PROP_MISSING_ALL",

  /**
   * At least one of the specified properties must be specified
   *
   * Expected variables:
   * {
   *    "names": "prop1, prop2, prop3, ..."
   * }
   */
  PROP_MISSING_ONE: "PROP_MISSING_ONE",

  /*
   * Service is locked for deployment
   */
  SERVICE_DEPLOYING: "SERVICE_DEPLOYING",

  /**
   * The user input is syntactically incorrect and cannot be parsed
   *
   * Expected variables:
   * {
   * }
   */
  SYNTAX_ERROR: "SYNTAX_ERROR"
};

module.exports = ServiceErrorTypes;
