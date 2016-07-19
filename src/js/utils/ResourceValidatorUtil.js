import MesosConstants from '../constants/MesosConstants';

const ResourceValidatorUtil = {
  isValidCPUSValue(value) {
    const cpus = parseFloat(value);

    return !Number.isNaN(cpus) && !!cpus.toString().match(/^[0-9\.]+$/) &&
      cpus >= MesosConstants.MIN_CPUS;
  },

  isValidDiskValue(value) {
    const disk = parseFloat(value);

    return !Number.isNaN(disk) && !!disk.toString().match(/^[0-9\.]+$/) &&
      disk >= 0;
  },

  isValidMemoryValue(value) {
    const memory = parseFloat(value);

    return !Number.isNaN(memory) && !!memory.toString().match(/^[0-9\.]+$/) &&
      memory >= MesosConstants.MIN_MEM;
  }
};

module.exports = ResourceValidatorUtil;
