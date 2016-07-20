import moment from 'moment';

const DateUtil = {
  /**
   * Creates a time string from time provided
   * @param  {Date|Number} ms number to convert to time string
   * @return {String} time string with the format 'MM-DD-YYYY [at] h:mma'
   */
  msToDateStr: function (ms) {
    return moment(ms).format('MM-DD-YYYY [at] h:mma');
  },

  /**
   * Creates relative time based on now and the time provided
   * @param  {Date|Number} ms number to convert to relative time string
   * @param  {Boolean} suppressRelativeTime whether to remove 'ago' from string
   * @return {String} time string relative from now
   */
  msToRelativeTime: function (ms, suppressRelativeTime = false) {
    return moment(ms).fromNow(suppressRelativeTime);
  },

  strToMs: function (str) {
    if (str == null) {
      return null;
    }

    return moment(str).valueOf();
  },

  getDuration: function (time, formatKey = 'seconds') {
    return moment.duration(time, formatKey).humanize();
  }
};

module.exports = DateUtil;
