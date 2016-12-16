import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';
import {findNestedPropertyInObject} from '../../../../../src/js/utils/Util';

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
      return [
        {path: ['cmd'], message: notBothMessage},
        {path: ['args'], message: notBothMessage}
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
              message: 'AppContainer id should start with \'sha512-\''
            }
          ];
        }

        return [];
      }

    }

    // Create one error for every field, instead of showing the error
    // to the root.
    const message = 'You must specify a command, an argument or a container';

    return [
      {path: ['cmd'], message},
      {path: ['args'], message},
      {path: ['container', 'docker', 'image'], message}
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

      return [
        {path: ['residency'], message},
        {path: ['container', 'volumes'], message}
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

      return [
        {path: ['ipAddress'], message},
        {path: ['discoveryInfo'], message},
        {path: ['container', 'docker', 'network'], message}
      ];
    }

    // No errors
    return [];
  }
};

module.exports = MarathonAppValidators;
