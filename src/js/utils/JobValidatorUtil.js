const JobValidatorUtil = {
  isValidJobID(serviceID) {
    if (typeof serviceID !== "string" || serviceID === "") {
      return false;
    }

    // This RegExp is taken from the metronome schema definition:
    // https://github.com/dcos/metronome/blob/master/api/src/main/resources/public/api/v1/schema/jobspec.schema.json
    const metronomeIdPattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9]+)*)([.][a-z0-9]([a-z0-9-]*[a-z0-9]+)*)*$/;

    return metronomeIdPattern.test(serviceID);
  },

  isValidCronSchedule(cronString) {
    if (typeof cronString !== "string" || cronString === "") {
      return false;
    }

    // Expect exactly 5 components
    var components = cronString.split(" ");
    if (components.length !== 5) {
      return false;
    }

    // Make sure each component contains valid characters
    const cronComponentPattern = /^[0-9*]+([0-9\-,/*])*$/;

    return components.every(function(component) {
      return cronComponentPattern.test(component);
    });
  }
};

module.exports = JobValidatorUtil;
