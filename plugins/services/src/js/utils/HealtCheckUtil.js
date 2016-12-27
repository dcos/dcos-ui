import HealthCheckProtocols from '../constants/HealtCheckProtocols';

module.exports = {
  isKnownProtocol(protocol) {
    return ['', ...Object.values(HealthCheckProtocols)].includes(protocol);
  }
};
