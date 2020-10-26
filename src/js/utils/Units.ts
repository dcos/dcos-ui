import Maths from "./Maths";

const Units = {
  formatResources(prop, request, limit) {
    const req = Units.formatResource(prop, request);
    const lim = Units.formatResource(prop, limit);
    return req === lim ? req : `${req} / ${lim}`;
  },
  formatResource(resource, value) {
    if (typeof value === "string" && value.toLowerCase().match(/unlimited/)) {
      return "unlimited";
    }
    value = Maths.round(value, 2);

    if (resource !== "cpus" && resource !== "gpus") {
      value = Units.filesize(value * 1024 * 1024, 1);
    }

    return value || 0;
  },

  filesize(size, decimals = 2, threshold?, multiplier?, units?) {
    size = size || 0;
    threshold = threshold || 800; // Steps to next unit if exceeded
    multiplier = multiplier || 1024;
    units = units || ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

    let factorize = 1;
    let unitIndex;

    for (unitIndex = 0; unitIndex < units.length; unitIndex++) {
      if (unitIndex > 0) {
        factorize = Math.pow(multiplier, unitIndex);
      }

      if (size < multiplier * factorize && size < threshold * factorize) {
        break;
      }
    }

    if (unitIndex >= units.length) {
      unitIndex = units.length - 1;
    }

    let filesize: number | string = size / factorize;

    filesize = filesize.toFixed(decimals);

    // This removes unnecessary 0 or . chars at the end of the string/decimals
    if (filesize.indexOf(".") > -1) {
      filesize = filesize.replace(/\.?0*$/, "");
    }

    return filesize + " " + units[unitIndex];
  },

  contractNumber(amount, options) {
    if (amount == null) {
      return amount;
    }

    options = {
      decimalPlaces: 2,
      ...options,
    };

    if (amount > 1) {
      const precision = Math.pow(10, options.decimalPlaces);
      amount = Math.round(amount * precision) / precision;
    } else if (
      amount < 1 &&
      options.forceFixedPrecision &&
      typeof amount === "number"
    ) {
      amount = amount.toFixed(options.decimalPlaces);
    }

    if (amount < 5000) {
      return "" + amount;
    }

    if (
      (amount >= 5000 && amount < 10000) ||
      (amount >= 1000000 && amount < 9999999)
    ) {
      options.decimalPlaces = 1;
    } else if ((amount >= 10000 && amount < 1000000) || amount >= 10000000) {
      options.decimalPlaces = 0;
    }

    const suffixes = ["K", "M", "B", "T"];

    let suffix: string | undefined = "";

    if (amount >= 999999999999999) {
      return "> 999T";
    }

    while (amount >= 1000) {
      amount /= 1000;
      amount = amount.toFixed(options.decimalPlaces);
      amount = parseFloat(amount);
      suffix = suffixes.shift();
    }

    if (amount % 1 === 0) {
      amount = amount.toFixed(0);
    }

    return amount + suffix;
  },
};

export default Units;
