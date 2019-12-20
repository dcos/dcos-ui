const Maths = {
  round(value, precision) {
    precision = precision || 0;
    const factor = Math.pow(10, precision);

    return Math.round(value * factor) / factor;
  },

  sum(array) {
    let sum = 0;

    array.forEach(function(value) {
      if (Array.isArray(value)) {
        sum += this.sum(value);
      } else {
        sum += value;
      }
    }, this);

    return sum;
  },

  mean(array) {
    return Maths.sum(array) / array.length;
  },

  /**
   * maps to domain (0,1)
   *
   * @param  {Number} value Number in range
   * @param  {Object} stats
   * @param  {Number} stats.min Minimum in range
   * @param  {Number} stats.max Maximum in range
   * @return {Number} A mapped number between (0,1)
   **/
  mapValue(value, stats) {
    value = parseFloat(value);

    const range = stats.max - stats.min;
    const min = stats.min;

    if (range === 0) {
      return min;
    }

    const v = (value - min) / range;

    if (isNaN(v)) {
      return undefined;
    }
    return v;
  },

  /**
   * pass in between 0 and 1
   *
   * @param  {Number} value Mapped number between (0,1)
   * @param  {Object} stats
   * @param  {Number} stats.min Minimum in range
   * @param  {Number} stats.max Maximum in range
   * @return {Number} An unmapped number between in the provided range
   **/
  unmapValue(value, stats) {
    value = stats.min + value * (stats.max - stats.min);

    if (isNaN(value)) {
      return undefined;
    }
    return value;
  }
};

export default Maths;
