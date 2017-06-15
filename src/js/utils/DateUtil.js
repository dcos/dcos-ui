import moment from "moment";

const DEFAULT_MULTIPLICANTS = {
  ms: 1,
  sec: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000
};

const DateUtil = {
  /*
   * Composes a string expression by de-composing the given time in milliseconds
   * into it's sub-multiplicants. For example:
   *
   * 11002 = 11002 ms (11 sec, 2 ms)
   */
  msToMultiplicants(ms, multiplicants = DEFAULT_MULTIPLICANTS) {
    const expressionComponents = [];
    const multiplicantKeys = Object.keys(multiplicants);

    // Start applying biggest to smallest fit
    for (let i = multiplicantKeys.length - 1; i >= 0; --i) {
      const unitName = multiplicantKeys[i];
      const unitSize = multiplicants[unitName];
      const fullFits = Math.floor(ms / unitSize);

      if (fullFits > 0) {
        expressionComponents.push(`${fullFits} ${unitName}`);
        ms = ms % unitSize;
      }
    }

    return expressionComponents;
  },

  /**
   * Creates a time string from time provided
   * @param  {Date|Number} ms number to convert to time string
   * @return {String} time string with the format 'MM-DD-YYYY [at] h:mma'
   */
  msToDateStr(ms) {
    return moment(ms).format("MM-DD-YYYY [at] h:mma");
  },

  /**
   * Creates a UTC time string from time provided
   * @param  {Date|Number} ms number to convert to UTC time string
   * @return {String} time string with the format 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
   */
  msToUTCDate(ms) {
    return moment(ms).utc().format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
  },

  /**
   * Creates a log timestamp string from time provided
   * @param  {Date|Number} ms number to convert to ANSI C time string
   * @return {String} time string with the format 'YYYY-MM-DD hh:mm:ss'
   */
  msToLogTime(ms) {
    return moment(ms).utc().format("YYYY-MM-DD hh:mm:ss");
  },

  /**
  /**
   * Creates relative time based on now and the time provided
   * @param  {Date|Number} ms number to convert to relative time string
   * @param  {Boolean} suppressRelativeTime whether to remove 'ago' from string
   * @return {String} time string relative from now
   */
  msToRelativeTime(ms, suppressRelativeTime = false) {
    return moment(ms).fromNow(suppressRelativeTime);
  },

  strToMs(str) {
    if (str == null) {
      return null;
    }

    return moment(str).valueOf();
  },

  getDuration(time, formatKey = "seconds") {
    return moment.duration(time, formatKey).humanize();
  }
};

module.exports = DateUtil;
