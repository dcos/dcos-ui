let Job = require('../Job');

describe('Job', function () {

  describe('#getId', function () {

    it('returns correct id', function () {
      let job = new Job({id: '/test/job'});

      expect(job.getId()).toEqual('/test/job');
    });

    it('throws when id doesn\'t start with a slash', function () {
      expect(function () { new Job({id: 'test/job'}); }).toThrow();
    });

    it('throws when id ends with a slash', function () {
      expect(function () { new Job({id: 'test/job'}); }).toThrow();
    });

    it('doesn\'t throw when no id is provided', function () {
      expect(function () { new Job({}); }).toThrow();
    });

    it('doesn\'t throw when no options are provided', function () {
      expect(function () { new Job(); }).toThrow();
    });

    it('doesn\'t throw when id is slash (\'/\')', function () {
      expect(function () { new Job({id: '/'}); }).toThrow();
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
