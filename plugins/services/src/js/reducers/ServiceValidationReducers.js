import {isValidServiceID} from '../utils/ServiceValidatorUtil';

module.exports = {
  id(state) {
    if (!isValidServiceID(state)) {
      return `Error: id cannot be "${state}"`;
    }
  },
  cpus(state) {
    if (typeof state !== 'number') {
      return `Error: cpus cannot be "${state}"`;
    }
  },
  mem(state) {
    if (!Number.isInteger(state)) {
      return `Error: mem cannot be "${state}"`;
    }
  },
  disk(state) {
    if (!Number.isInteger(state)) {
      return `Error: disk cannot be "${state}"`;
    }
  },
  instances(state) {
    if (!Number.isInteger(state)) {
      return `Error: instances cannot be "${state}"`;
    }
  },
  cmd(state) {
    if (typeof state !== 'string') {
      return `Error: cmd cannot be "${state}"`;
    }
  }
};
