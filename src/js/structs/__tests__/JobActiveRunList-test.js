let moment = require('moment');

let JobActiveRunList = require('../JobActiveRunList');

describe('JobActiveRunList', function () {

  describe('#getLongestRunningActiveRun', function () {

    it('returns the longest running active run', function () {
      let activeRunList = new JobActiveRunList({
        items: [
          {'createdAt': '1990-01-03t00:00:00z-1'},
          {'createdAt': '1985-01-03t00:00:00z-1'},
          {'createdAt': '1995-01-03t00:00:00z-1'}
        ]
      });

      expect(activeRunList.getLongestRunningActiveRun().getDateCreated().valueOf())
        .toEqual(moment('1985-01-03T00:00:00Z-1').valueOf());
    });

    it('returns the longest running active run', function () {
      let activeRunList = new JobActiveRunList({
        items: [
          {'createdAt': '1990-01-03t00:10:00z-1'},
          {'createdAt': '1990-01-03t00:05:00z-1'},
          {'createdAt': '1990-01-03t00:01:00z-1'}
        ]
      });

      expect(activeRunList.getLongestRunningActiveRun().getDateCreated().valueOf())
        .toEqual(moment('1990-01-03T00:01:00Z-1').valueOf());
    });

  });

});
