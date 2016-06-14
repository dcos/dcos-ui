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

    it('does\'t throw and error if run configuration is undefined',
      function () {
        let job = new Job({});

        expect(function () {
          job.getCommand()
        }).not.toThrow();
      }
    );
  });

  describe('#getCpus', function () {

    it('returns the correct cpus', function () {
      let job = new Job({
        run: {
          cpus: 2
        }
      });

      expect(job.getCpus()).toEqual(2);
    });

    it('defaults to the correct value if property is undefined', function () {
      let job = new Job({
        run: {}
      });

      expect(job.getCpus()).toEqual(0.01);
    });

    it('defaults to the correct value if run configuration is undefined',
      function () {
        let job = new Job({});

        expect(job.getCpus()).toEqual(0.01);
      }
    );

  });

  describe('#getDescription', function () {

    it('returns the description', function () {
      let job = new Job({id: '/foo', description: 'bar'});

      expect(job.getDescription()).toEqual('bar');
    });

  });

  describe('#getDisk', function () {

    it('returns the correct disk', function () {
      let job = new Job({
        run: {
          disk: 125
        }
      });

      expect(job.getDisk()).toEqual(125);
    });

    it('defaults to the correct value if property is undefined', function () {
      let job = new Job({
        run: {}
      });

      expect(job.getDisk()).toEqual(0);
    });

    it('defaults to the correct value if run configuration is undefined',
      function () {
        let job = new Job({});

        expect(job.getDisk()).toEqual(0);
      }
    );

  });

  describe('#getId', function () {

    it('returns correct id', function () {
      let job = new Job({id: 'test.job'});

      expect(job.getId()).toEqual('test.job');
    });

  });

  describe('#getLabels', function () {

    it('returns the correct labels', function () {
      let job = new Job({
        labels: {
          foo: 'bar'
        }
      });

      expect(job.getLabels()).toEqual({foo: 'bar'});
    });

    it('defaults to an empty object if property is undefined', function () {
      let job = new Job({
        run: {}
      });

      expect(job.getLabels()).toEqual({});
    });

  });

  describe('#getMem', function () {

    it('returns the correct mem', function () {
      let job = new Job({
        run: {
          mem: 49
        }
      });

      expect(job.getMem()).toEqual(49);
    });

    it('defaults to the correct value if property is undefined', function () {
      let job = new Job({
        run: {}
      });

      expect(job.getMem()).toEqual(32);
    });

    it('defaults to the correct value if run configuration is undefined',
      function () {
        let job = new Job({});

        expect(job.getMem()).toEqual(32);
      }
    );

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
