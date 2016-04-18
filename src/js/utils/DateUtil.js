import moment from 'moment';

const DateUtil = {
  msToDateStr: function (ms) {
    let date = new Date(ms);
    let dateStr = '';

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    dateStr += date.getMonth() + 1 + '-';
    dateStr += date.getDate() + '-';
    dateStr += date.getFullYear() % 100 + ' at ';
    dateStr += DateUtil.formatAMPM(date);

    return dateStr;
  },

  msToRelativeTime: function (ms) {
    return moment.unix(ms).fromNow();
  },

  formatAMPM: function (date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    let meridiem = 'am';
    if (hours >= 12) {
      meridiem = 'pm';
    }

    hours = hours % 12;
    if (hours === 0) {
      hours = 12;
    }

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    var strTime = `${hours}:${minutes} ${meridiem}`;
    return strTime;
  }
};

module.exports = DateUtil;
