let moment = require('moment');

let JobActiveRun = require('../JobActiveRun');
let JobTaskList = require('../JobTaskList');

describe('JobActiveRun', function () {

  describe('#getDateCreated', function () {

    it('should return null if createdAt is undefined', function () {
      let activeRun = new JobActiveRun({foo: 'bar'});
      expect(activeRun.getDateCreated()).toEqual(null);
    });

    it('should return the correct value in milliseconds', function () {
      let activeRun = new JobActiveRun({createdAt: '1990-01-03T02:00:00Z-1'});
      expect(activeRun.getDateCreated()).toEqual(631332000000);
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
