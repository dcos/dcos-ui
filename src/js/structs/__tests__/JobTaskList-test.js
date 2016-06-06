let moment = require('moment');

let JobTaskList = require('../JobTaskList');

describe('JobTaskList', function () {

  describe('#getLongestRunningTask', function () {

    it('returns the longest running task', function () {
      let activeRunList = new JobTaskList({
        items: [
          {'startedAt': '1990-01-03t00:00:00z-1'},
          {'startedAt': '1985-01-03t00:00:00z-1'},
          {'startedAt': '1995-01-03t00:00:00z-1'}
        ]
      });

      expect(activeRunList.getLongestRunningTask().getDateStarted().valueOf())
        .toEqual(moment('1985-01-03T00:00:00Z-1').valueOf());
    });

    it('handles tasks with undefined startedAt values', function () {
      let activeRunList = new JobTaskList({
        items: [
          {'startedAt': '1990-03-03t00:00:00z-1'},
          {foo: 'bar'},
          {'startedAt': '1990-10-03t00:00:00z-1'},
          {bar: 'baz'},
          {'startedAt': '1990-01-03t00:00:00z-1'}
        ]
      });

      expect(activeRunList.getLongestRunningTask().getDateStarted().valueOf())
        .toEqual(moment('1990-01-03T00:00:00Z-1').valueOf());
    });

  });

});
