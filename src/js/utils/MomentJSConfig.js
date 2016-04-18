import moment from 'moment';

moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'secs',
    m: 'a minute',
    mm: '%d mins',
    h: 'an hour',
    hh: '%d hrs',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d mos',
    y: 'a year',
    yy: '%d yrs'
  }
});
