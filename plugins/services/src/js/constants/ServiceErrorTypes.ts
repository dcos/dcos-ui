/**
 * A generic type of error without any detailed information
 */
export const GENERIC = "GENERIC";

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
export const PROP_CONFLICT = "PROP_CONFLICT";

/**
 * The specified property is part of a deprecated API
 *
 * Expected variables:
 * {
 *   "name": "property name"
 * }
 */
export const PROP_DEPRECATED = "PROP_DEPRECATED";

/**
 * All of the specified properties must be specified
 *
 * Expected variables:
 * {
 *    "names": "prop1, prop2, prop3, ..."
 * }
 */
export const PROP_MISSING_ALL = "PROP_MISSING_ALL";

/**
 * At least one of the specified properties must be specified
 *
 * Expected variables:
 * {
 *    "names": "prop1, prop2, prop3, ..."
 * }
 */
export const PROP_MISSING_ONE = "PROP_MISSING_ONE";

/*
 * Service is locked for deployment
 */
export const SERVICE_DEPLOYING = "SERVICE_DEPLOYING";

/**
 * The user input is syntactically incorrect and cannot be parsed
 *
 * Expected variables:
 * {
 * }
 */
export const SYNTAX_ERROR = "SYNTAX_ERROR";
