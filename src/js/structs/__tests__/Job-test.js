let Job = require('../Job');
let JobActiveRunList = require('../JobActiveRunList');

describe('Job', function () {

  describe('#getActiveRuns', function () {

    it('returns an instance of JobActiveRunList', function () {
      let job = new Job({id: '/foo', activeRuns: []});

      expect(job.getActiveRuns() instanceof JobActiveRunList).toBeTruthy();
    });

  });

  describe('#getCommand', function () {

    it('returns the command', function () {
      let job = new Job({id: '/foo', run: {cmd: 'foo'}});

      expect(job.getCommand()).toEqual('foo');
    });

  });

  describe('#getDescription', function () {

    it('returns the description', function () {
      let job = new Job({id: '/foo', description: 'bar'});

      expect(job.getDescription()).toEqual('bar');
    });

  });

  describe('#getId', function () {

    it('returns correct id', function () {
      let job = new Job({id: 'test.job'});

      expect(job.getId()).toEqual('test.job');
    });

  });

  describe('#getName', function () {

    it('returns correct name', function () {
      let job = new Job({id: 'test.job'});

      expect(job.getName()).toEqual('job');
    });

  });

  describe('#getSchedules', function () {

    it('returns the schedules', function () {
      let job = new Job({id: '/foo', schedules: ['bar']});

      expect(job.getSchedules()).toEqual(['bar']);
    });

  });

});
