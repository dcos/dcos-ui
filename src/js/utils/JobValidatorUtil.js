const JobValidatorUtil = {

  isValidJobID(serviceID) {
    if (typeof serviceID !== 'string' || serviceID === '') {
      return false;
    }

    // This RegExp is taken from the metronome schema definition:
    // https://github.com/dcos/metronome/blob/master/api/src/main/resources/public/api/v1/schema/jobspec.schema.json
    const metronomeIdPattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9]+)*)([.][a-z0-9]([a-z0-9-]*[a-z0-9]+)*)*$/;
    return metronomeIdPattern.test(serviceID);

  },

  isValidCronSchedule(cronString) {
    if (typeof cronString !== 'string' || cronString === '') {
      return false;
    }

    // This regex also ensures that field values are in correct ranges
    const cronPattern = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronPattern.test(cronString);

  }

};

module.exports = JobValidatorUtil;
