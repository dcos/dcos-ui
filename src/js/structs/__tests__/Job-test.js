let Job = require('../Job');

describe('Job', function () {

  describe('#getId', function () {

    it('returns correct id', function () {
      let job = new Job({id: '/test/job'});

      expect(job.getId()).toEqual('/test/job');
    });

    it('returns correct id', function () {
      let job = new Job({id: '/test/job'});

      expect(job.getId()).toEqual('/test/job');
    });

  });

  describe('#getName', function () {

    it('returns correct name', function () {
      let job = new Job({id: '/test/job'});

      expect(job.getName()).toEqual('job');
    });

  });

});
