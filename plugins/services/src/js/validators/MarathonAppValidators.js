import ContainerConstants from '../constants/ContainerConstants';
import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';
import {PROP_CONFLICT, PROP_DEPRECATED, PROP_MISSING_ALL, PROP_MISSING_ONE} from '../constants/ServiceErrorTypes';

const {DOCKER} = ContainerConstants.type;

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
      const notBothMessage = 'Please specify only one of `cmd` or `args`';
      const type = PROP_CONFLICT;
      const variables = {
        feature1: 'cmd',
        feature2: 'args'
      };

      return [
        {path: ['cmd'], message: notBothMessage, type, variables},
        {path: ['args'], message: notBothMessage, type, variables}
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
        if (app.container.appc.id &&!/^sha512-./.exec(app.container.appc.id)) {
          return [
            {
              path: ['container', 'appc', 'id'],
              message: 'AppContainer id should start with \'sha512-\'',
              type: 'STRING_PATTERN',
              variables: {
                pattern: '^sha512-'
              }
            }
          ];
        }

        return [];
      }

    }

    // Create one error for every field, instead of showing the error
    // to the root.
    const message = 'You must specify a command, an argument or a container';
    const type = PROP_MISSING_ONE;
    const variables = {
      names: 'cmd, args, container.docker.image'
    };

    return [
      {path: ['cmd'], message, type, variables},
      {path: ['args'], message, type, variables},
      {path: ['container', 'docker', 'image'], message, type, variables}
    ];
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  complyWithResidencyRules(app) {
    const hasAppResidency = !ValidatorUtil.isEmpty(app.residency);
    let hasPersistentVolumes = false;

    // Check if app has at leas one persistent volume
    if (app.container && app.container.volumes) {
      hasPersistentVolumes = app.container.volumes
        .some((volume) => !ValidatorUtil.isEmpty(volume.persistent));
    }

    if (hasAppResidency !== hasPersistentVolumes) {
      const message = 'AppDefinition must contain persistent volumes and ' +
        'define residency';
      const type = PROP_MISSING_ALL;
      const variables = {
        names: 'residency, container.volumes'
      };

      return [
        {path: ['residency'], message, type, variables},
        {path: ['container', 'volumes'], message, type, variables}
      ];
    }

    return [];
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  complyWithIpAddressRules(app) {

    // (AppDefinition.scala#L697)
    if (ValidatorUtil.isEmpty(app.ipAddress)) {
      return [];
    }

    // (AppDefinition.scala#L538)
    if (ValidatorUtil.isEmpty(app.discoveryInfo)) {
      return [];
    }

    // (AppDefinition.scala#L539)
    const network = findNestedPropertyInObject(app, 'container.docker.network');
    if (ValidatorUtil.isEmpty(network)) {
      return [];
    }

    // (AppDefinition.scala#L539)
    if (/^(BRIDGE|USER)$/.exec(app.container.docker.network)) {
      const message = 'ipAddress/discovery is not allowed for Docker ' +
        'containers using BRIDGE or USER networks';
      const type = PROP_CONFLICT;
      const variables = {
        feature1: 'ipAddress or discoveryInfo',
        feature2: 'container.docker.network'
      };

      return [
        {path: ['ipAddress'], message, type, variables},
        {path: ['discoveryInfo'], message, type, variables},
        {path: ['container', 'docker', 'network'], message, type, variables}
      ];
    }

    // No errors
    return [];
  },

  /*
   * This validator ensures that `container.volumes.X.containerPath` does
   * not contain the character '/', according to marathon `^[^/]*$ rule
   *
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  containerVolmesPath(app) {
    const volumes = findNestedPropertyInObject(app, 'container.volumes');
    if (ValidatorUtil.isEmpty(volumes)) {
      return [];
    }

    return volumes.reduce(function (memo, volume, index) {
      const containerPath = volume.containerPath || '';

      // Local or external volumes require the same check
      if (containerPath.indexOf('/') !== -1) {
        memo.push({
          path: ['container', 'volumes', index, 'containerPath'],
          message: 'Should not contain "/"'
        });
      }

      return memo;
    }, []);
  },

  /**
   * @param {Object} app - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  mustContainImageOnDocker(app) {
    const type = findNestedPropertyInObject(app, 'container.type');
    const image = findNestedPropertyInObject(app, 'container.docker.image');

    if ((type === DOCKER) && ValidatorUtil.isEmpty(image)) {
      return [
        {
          path: ['container', 'docker', 'image'],
          message: 'Must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings"',
          type: 'PROP_IS_MISSING',
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
    if (ValidatorUtil.isDefined(app.uris) &&
        ValidatorUtil.isDefined(app.fetch)) {
      const message = '`uris` are deprecated. Please use `fetch` instead';
      const type = PROP_DEPRECATED;
      const variables = {
        name: 'uris'
      };

      return [
        {path: ['uris'], message, type, variables}
      ];
    }

    // No errors
    return [];
  }
};

module.exports = MarathonAppValidators;
