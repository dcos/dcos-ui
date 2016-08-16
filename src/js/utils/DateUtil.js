import moment from 'moment';

const DateUtil = {
  /**
   * Creates a time string from time provided
   * @param  {Date|Number} ms number to convert to time string
   * @return {String} time string with the format 'MM-DD-YYYY [at] h:mma'
   */
  msToDateStr(ms) {
    return moment(ms).format('MM-DD-YYYY [at] h:mma');
  },

  /**
   * Creates a UTC time string from time provided
   * @param  {Date|Number} ms number to convert to UTC time string
   * @return {String} time string with the format 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
   */
  msToUTCDate(ms) {
    return moment(ms).utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
  },

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

  getDuration(time, formatKey = 'seconds') {
    return moment.duration(time, formatKey).humanize();
  }
};

module.exports = DateUtil;
