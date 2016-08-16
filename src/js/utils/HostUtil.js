const HostUtil = {
  stringToHostname(string) {
    const HOSTNAME_MAX_LENGTH = 63;

    if (string == null) {
      return string;
    }

    // Strip or convert illegal characters
    let host = string.toLowerCase().replace(/[_\.]/g, '-').replace(/[^a-z0-9-]/g, '');

    // Strip symbols from beginning
    while (host.startsWith('-')) {
      host = host.slice(1);
    }

    // Strip symbols from middle if greater than max length
    while (host.length > HOSTNAME_MAX_LENGTH && host.charAt(HOSTNAME_MAX_LENGTH - 1) === '-') {
      host = host.slice(0, HOSTNAME_MAX_LENGTH - 1).concat(host.slice(HOSTNAME_MAX_LENGTH));
    }

    host = host.slice(0, HOSTNAME_MAX_LENGTH);

    // Strip symbols from end
    while (host.endsWith('-')) {
      host = host.slice(0, host.length - 1);
    }

    return host.slice(0, HOSTNAME_MAX_LENGTH);
  }
};

module.exports = HostUtil;
