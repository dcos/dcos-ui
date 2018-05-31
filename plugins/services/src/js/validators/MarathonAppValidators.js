import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import {
  PROP_CONFLICT,
  PROP_DEPRECATED,
  PROP_MISSING_ONE,
  SYNTAX_ERROR
} from "../constants/ServiceErrorTypes";
import ContainerConstants from "../constants/ContainerConstants";
import PlacementValidators from "./PlacementsValidators";

const { DOCKER } = ContainerConstants.type;

const MarathonAppValidators = {
  /**
   * Ensure that the user has provided either a `cmd` or a docker image field.
   *
   * The following checks are ported from the following marathon file:
   *
   * https://github.com/mesosphere/marathon/blob
   *       /08bc0aed722ad9f3e989a597cb264a994387756f/src/main/scala/mesosphere
   *       /marathon/state/AppDefinition.scala
   *
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  containsCmdArgsOrContainer(app) {
    const hasCmd = !ValidatorUtil.isEmpty(app.cmd);
    const hasArgs = !ValidatorUtil.isEmpty(app.args);

    // Dont accept both `args` and `cmd`
    if (hasCmd && hasArgs) {
      const notBothMessage = "Please specify only one of `cmd` or `args`";
      const type = PROP_CONFLICT;
      const isUnanchored = true;
      const variables = {
        feature1: "cmd",
        feature2: "args"
      };

      return [
        {
          path: ["cmd"],
          message: notBothMessage,
          type,
          isUnanchored,
          variables
        },
        {
          path: ["args"],
          message: notBothMessage,
          type,
          isUnanchored,
          variables
        }
      ];
    }

    // Check if we have either of them
    if (hasCmd || hasArgs) {
      return [];
    }

    // Additional checks if we have container
    if (app.container) {
      // MesosDocker type of container (AppDefinition.scala#L553)
      if (app.container.docker && app.container.docker.image) {
        return [];
      }

      // MesosAppC type of container (Container.scala#L165)
      if (app.container.appc && app.container.appc.image) {
        // An image ID is a string of the format 'hash-value', where 'hash' is
        // the hash algorithm used and 'value' is the hex-encoded digest.
        // Currently the only permitted hash algorithm is sha512.
        // (Validation in Container.scala#L158)
        if (app.container.appc.id && !/^sha512-./.exec(app.container.appc.id)) {
          return [
            {
              path: ["container", "appc", "id"],
              message: "AppContainer id should start with 'sha512-'",
              type: "STRING_PATTERN",
              variables: {
                pattern: "^sha512-"
              }
            }
          ];
        }

        return [];
      }
    }

    // Create one error for every field, instead of showing the error
    // to the root.
    const message = "You must specify a command, an argument or a container";
    const type = PROP_MISSING_ONE;
    const variables = {
      names: "cmd, args, container.docker.image"
    };
    const isUnanchored = true;

    return [
      { path: ["cmd"], message, type, isUnanchored, variables },
      { path: ["args"], message, type, isUnanchored, variables },
      {
        path: ["container", "docker", "image"],
        message,
        type,
        isUnanchored,
        variables
      }
    ];
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  mustContainImageOnDocker(app) {
    const type = findNestedPropertyInObject(app, "container.type");
    const image = findNestedPropertyInObject(app, "container.docker.image");

    if (type === DOCKER && ValidatorUtil.isEmpty(image)) {
      return [
        {
          path: ["container", "docker", "image"],
          message:
            'Must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings"',
          type: "PROP_IS_MISSING",
          variables: {}
        }
      ];
    }

    return [];
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  mustNotContainUris(app) {
    if (
      ValidatorUtil.isDefined(app.uris) &&
      ValidatorUtil.isDefined(app.fetch)
    ) {
      const message = "`uris` are deprecated. Please use `fetch` instead";
      const type = PROP_DEPRECATED;
      const variables = {
        name: "uris"
      };

      return [{ path: ["uris"], message, type, variables }];
    }

    // No errors
    return [];
  },

  validateConstraints(app) {
    const constraints = findNestedPropertyInObject(app, "constraints") || [];

    const errors = [];

    PlacementValidators.validateConstraints(constraints).map(error => {
      errors.push(
        Object.assign({}, error, {
          path: ["constraints"].concat(error.path)
        })
      );
    });

    errors.push(...PlacementValidators.mustHaveUniqueOperatorField(app));

    return errors;
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  validateLabels(app) {
    if (ValidatorUtil.isDefined(app.labels)) {
      return Object.keys(app.labels)
        .reduce(function(accumulator, labelKey) {
          if (/^\s|\s$/.test(labelKey)) {
            accumulator.push(`labels.${labelKey}`);
          }

          return accumulator;
        }, [])
        .map(function(labelPath) {
          return {
            path: [labelPath],
            message: "Keys must not start or end with whitespace characters",
            type: SYNTAX_ERROR,
            variables: { name: "labels" }
          };
        });
    }

    // No errors
    return [];
  }
};

module.exports = MarathonAppValidators;
