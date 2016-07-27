const NetworkValidatorUtil = {
  isValidPort(value) {
    const port = parseInt(value, 10);

    return !Number.isNaN(port) && port >= 0 && port <= 65535;
  }
};

module.exports = NetworkValidatorUtil;
