import ValidatorUtil from '../../../../../src/js/utils/ValidatorUtil';

const MarathonAppValidators = {

  /**
   * Ensure that the user has provided either a `cmd` or a docker image field.
   *
   * @param {Object} data - The data to validate
   * @returns {Array} Returns an array with validation errors
   */
  CmdOrDockerImage(data) {

    // Check if we have `cmd`
    if (!ValidatorUtil.isEmpty(data.cmd)) {
      return [];
    }

    // Check if we have `docker.image`
    if (data.container && data.container.docker && data.container.docker.image) {
      return [];
    }

    // Create one error for every field, instead of showing the error
    // to the root.
    const message = 'You must specify at least a command or a docker image';
    return [
      {path: ['cmd'], message},
      {path: ['container', 'docker', 'image'], message}
    ];
  }

};

module.exports = MarathonAppValidators;
