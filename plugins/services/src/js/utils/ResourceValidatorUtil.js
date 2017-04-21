import MesosConstants from "../constants/MesosConstants";

const ResourceValidatorUtil = {
  isValidCPUs(value) {
    const cpus = parseFloat(value);

    return (
      !Number.isNaN(cpus) &&
      /^[0-9.]+$/.test(cpus) &&
      cpus >= MesosConstants.MIN_CPUS
    );
  },

  isValidDisk(value) {
    const disk = parseFloat(value);

    return !Number.isNaN(disk) && /^[0-9.]+$/.test(disk) && disk >= 0;
  },

  isValidMemory(value) {
    const memory = parseFloat(value);

    return (
      !Number.isNaN(memory) &&
      /^[0-9.]+$/.test(memory) &&
      memory >= MesosConstants.MIN_MEM
    );
  }
};

module.exports = ResourceValidatorUtil;
