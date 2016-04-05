import Maths from './Maths';

const Units = {
  formatResource: function (resource, value) {
    value = Maths.round(value, 2);

    if (resource !== 'cpus') {
      value = Units.filesize(value * 1024 * 1024, 1);
    }

    return value;
  },

  filesize: function (size, decimals, threshold, multiplier, units) {
    size = size || 0;
    if (decimals == null) {
      decimals = 2;
    }
    threshold = threshold || 800; // Steps to next unit if exceeded
    multiplier = multiplier || 1024;
    units = units || ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

    var factorize = 1;
    var unitIndex;

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

    var filesize = size / factorize;

    filesize = filesize.toFixed(decimals);

    // This removes unnecessary 0 or . chars at the end of the string/decimals
    if (filesize.indexOf('.') > -1) {
      filesize = filesize.replace(/\.?0*$/, '');
    }

    return filesize + ' ' + units[unitIndex];
  },

  contractNumber: function (amount, options) {
    if (amount == null) {
      return amount;
    }

    options = Object.assign({decimalPlaces: 2}, options || {});

    if (amount > 1) {
      let precision = Math.pow(10, options.decimalPlaces);
      amount = Math.round(amount * precision) / precision;
    } else if (amount < 1 && options.forceFixedPrecision
      && typeof amount === 'number') {
      amount = amount.toFixed(options.decimalPlaces);
    }

    if (amount < 5000) {
      return '' + amount;
    }

    if ((amount >= 5000 && amount < 10000) ||
      (amount >= 1000000 && amount < 9999999)) {
      options.decimalPlaces = 1;
    } else if ((amount >= 10000 && amount < 1000000) || (amount >= 10000000)) {
      options.decimalPlaces = 0;
    }

    let suffixes = ['K', 'M', 'B', 'T'];

    let suffix = '';

    if (amount >= 999999999999999) {
      return '> 999T';
    }

    while (amount >= 1000) {
      amount /= 1000;
      amount = amount.toFixed(options.decimalPlaces);
      amount = parseFloat(amount, 10);
      suffix = suffixes.shift();
    }

    if (amount % 1 === 0) {
      amount = amount.toFixed(0);
    }

    return amount + suffix;
  }
};

module.exports = Units;
