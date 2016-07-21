const ServiceValidatorUtil = {
  isValidServiceID(serviceID) {
    if (typeof serviceID !== 'string' || serviceID === '') {
      return false;
    }

    // This RegExp is taken from the ID field explanation described here:
    // https://mesosphere.github.io/marathon/docs/rest-api.html#post-v2-apps
    const serviceIDSegmentPattern = new RegExp(
      '^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])[.])' +
      '*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$'
    );

    return serviceID.split('/').every(function (segment, index) {

      return (index === 0 && (segment == null || segment === '')) ||
        segment === '.' || segment === '..' ||
        serviceIDSegmentPattern.test(segment);
    });
  }
};

module.exports = ServiceValidatorUtil;
