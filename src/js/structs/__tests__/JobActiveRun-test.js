let moment = require('moment');

let JobActiveRun = require('../JobActiveRun');
let JobTaskList = require('../JobTaskList');

describe('JobActiveRun', function () {

  describe('#getDateCreated', function () {

    it('should return null if startedAt is undefined', function () {
      let activeRun = new JobActiveRun({foo: 'bar'});
      expect(activeRun.getDateCreated()).toEqual(null);
    });

    it('should return a moment instance', function () {
      let activeRun = new JobActiveRun({createdAt: '1985-04-30'});
      expect(activeRun.getDateCreated() instanceof moment).toBeTruthy();
    });

    it('should properly parse the time-zone format from API', function () {
      let activeRun = new JobActiveRun({createdAt: '1990-01-03t02:00:00z-1'});
      expect(activeRun.getDateCreated().valueOf())
        .toEqual(moment('1990-01-03T02:00:00Z-1').valueOf());
    });

  });

  describe('#getJobID', function () {

    it('should return the jobId', function () {
      let activeRun = new JobActiveRun({jobId: 'foo'});
      expect(activeRun.getJobID()).toEqual('foo');
    });

  });

  describe('#getStatus', function () {

    it('should return the id', function () {
      let activeRun = new JobActiveRun({status: 'foo'});
      expect(activeRun.getStatus()).toEqual('foo');
    });

  });

  describe('#getTasks', function () {

    it('should return an instance of JobTaskList', function () {
      let activeRun = new JobActiveRun({id: 'foo', tasks: []});
      expect(activeRun.getTasks() instanceof JobTaskList).toBeTruthy();
    });

  });

});
