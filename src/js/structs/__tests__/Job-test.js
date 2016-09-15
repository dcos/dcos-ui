const Job = require('../Job');
const JobRunList = require('../JobRunList');

describe('Job', function () {

  describe('#getActiveRuns', function () {

    it('returns an instance of JobActiveRunList', function () {
      let job = new Job({id: 'foo', activeRuns: []});

      expect(job.getActiveRuns() instanceof JobRunList).toBeTruthy();
    });

  });

  describe('#getCommand', function () {

    it('returns the command', function () {
      let job = new Job({id: 'foo', run: {cmd: 'foo'}});

      expect(job.getCommand()).toEqual('foo');
    });

    it('does\'t throw and error if run configuration is undefined',
      function () {
        let job = new Job({});

        expect(function () {
          job.getCommand();
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
      let job = new Job({id: 'foo', description: 'bar'});

      expect(job.getDescription()).toEqual('bar');
    });

  });

  describe('#getDocker', function () {

    it('returns the docker configuration', function () {
      let job = new Job({id: 'foo', run: {docker: {image: 'busybox'}}});

      expect(job.getDocker()).toEqual({image: 'busybox'});
    });

    it('defaults to an empty object if property is undefined', function () {
      let job = new Job({run: {}});

      expect(job.getDocker()).toEqual({});
    });

    it('defaults to an empty object  if run configuration is undefined',
      function () {
        let job = new Job({run: {}});

        expect(job.getDocker()).toEqual({});
      }
    );

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

  describe('#getJobRuns', function () {

    it('returns an instance of JobRunList', function () {
      let job = new Job({id: 'foo', activeRuns: []});

      expect(job.getJobRuns()).toEqual(jasmine.any(JobRunList));
    });

    it('includes failed finished runs', function () {
      let job = new Job({
        id: 'foo', activeRuns: [], history: {
          failedFinishedRuns: [
            {
              id: 'bar'
            }
          ]
        }
      });

      expect(job.getJobRuns().getItems()[0].id).toEqual('bar');
    });

    it('includes successful finished runs', function () {
      let job = new Job({
        id: 'foo', activeRuns: [], history: {
          successfulFinishedRuns: [
            {
              id: 'bar'
            }
          ]
        }
      });

      expect(job.getJobRuns().getItems()[0].id).toEqual('bar');
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

  describe('#getLastRunStatus', function () {

    it('returns an object with the time in ms', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {
          lastSuccessAt: '1990-04-30T00:00:00Z',
          lastFailureAt: '1985-04-30T00:00:00Z'
        }
      });

      expect(job.getLastRunStatus().time).toEqual(641433600000);
    });

    it('returns the most recent status', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {
          lastSuccessAt: '1990-04-30T00:00:00Z',
          lastFailureAt: '1985-04-30T00:00:00Z'
        }
      });

      expect(job.getLastRunStatus().status).toEqual('Success');
    });

    it('returns the most recent status', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {
          lastSuccessAt: '1985-04-30T00:00:00Z',
          lastFailureAt: '1990-04-30T00:00:00Z'
        }
      });

      expect(job.getLastRunStatus().status).toEqual('Failed');
    });

    it('returns N/A status if both are undefiend', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {}
      });

      expect(job.getLastRunStatus().status).toEqual('N/A');
      expect(job.getLastRunStatus().time).toEqual(null);
    });

    it('returns success if lastFailureAt is undefiend', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {
          lastSuccessAt: '1990-04-30T00:00:00Z'
        }
      });

      expect(job.getLastRunStatus().status).toEqual('Success');
    });

    it('returns success if lastSuccessAt is undefiend', function () {
      let job = new Job({
        id: 'test.job',
        historySummary: {
          lastFailureAt: '1990-04-30T00:00:00Z'
        }
      });

      expect(job.getLastRunStatus().status).toEqual('Failed');
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
      let job = new Job({id: 'foo', schedules: ['bar']});

      expect(job.getSchedules()).toEqual(['bar']);
    });

    it('returns an empty array if schedules is undefined', function () {
      let job = new Job({id: '/foo'});

      expect(job.getSchedules()).toEqual([]);
    });

  });

  describe('#getScheduleStatus', function () {

    it('returns the longest running job\'s status', function () {
      let job = new Job({
        id: '/foo',
        activeRuns: [{
          status: 'foo',
          createdAt: '1985-01-03t00:00:00z-1'
        }, {
          status: 'bar',
          createdAt: '1990-01-03t00:00:00z-1'
        }],
        schedules: ['bar']
      });

      expect(job.getScheduleStatus()).toEqual('foo');
    });

    it('returns scheduled if there are no active runs and the schedule is enabled', function () {
      let job = new Job({
        id: '/foo',
        activeRuns: [],
        schedules: [{
          enabled: true
        }]
      });

      expect(job.getScheduleStatus()).toEqual('SCHEDULED');
    });

    it('returns unscheduled if there are no active runs and no enabled schedule', function () {
      let job = new Job({
        id: '/foo',
        activeRuns: [],
        scheduled: [{
          enabled: false
        }]
      });

      expect(job.getScheduleStatus()).toEqual('UNSCHEDULED');
    });

    it('returns unscheduled if there are no active runs and no schedule', function () {
      let job = new Job({
        id: '/foo',
        activeRuns: []
      });

      expect(job.getScheduleStatus()).toEqual('UNSCHEDULED');
    });

  });

  describe('#toJSON', function () {

    it('returns a object with the values in _itemData', function () {
      let item = new Job({foo: 'bar', baz: 'qux'});
      expect(item.toJSON()).toEqual({foo:'bar', baz:'qux'});
    });

    it('returns a JSON string with the values in _itemData', function () {
      let item = new Job({foo: 'bar', baz: 'qux'});
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });

    it('should drop blacklisted keys', function () {
      let item = new Job({foo: 'bar', baz: 'qux', 'history': []});
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });

  });

});
