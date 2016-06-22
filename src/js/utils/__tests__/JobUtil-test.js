jest.dontMock('../ServiceUtil');
jest.dontMock('../../structs/Service');

var Job = require('../../structs/Job');
var JobUtil = require('../JobUtil');

describe('JobUtil', function () {

  describe('#createJobFromFormModel', function () {

    it('should return instance of Job', function () {
      const job = JobUtil.createJobFromFormModel({
        general: {
          id: 'test'
        }
      });

      expect(job).toEqual(jasmine.any(Job));
    });

    it('should return instance Job if null is provided', function () {
      expect(JobUtil.createJobFromFormModel(null)).toEqual(jasmine.any(Job));
    });

    it('should return instance Job if empty object is provided', function () {
      expect(JobUtil.createJobFromFormModel({})).toEqual(jasmine.any(Job));
    });

    it('should convert form model to the corresponding job', function () {
      const job = JobUtil.createJobFromFormModel({
        general: {
          id: 'test',
          cmd: 'sleep 1000;'
        }
      });

      expect(job.getId()).toEqual('test');
      expect(job.getCommand()).toEqual('sleep 1000;');
    });

  });

  describe('#createFormModelFromSchema', function () {

    it('should create the correct model', function () {
      const schema = {
        type: 'object',
        properties: {
          general: {
            description: 'Configure your container',
            type: 'object',
            properties: {
              id: {
                default: 'job.id',
                title: 'ID',
                description: 'The id for the job',
                type: 'string',
                getter: function (job) {
                  return job.getId();
                }
              }
            }
          }
        },
        required: [
          'general'
        ]
      };

      const job = new Job({
        id: 'test',
      });

      expect(JobUtil.createFormModelFromSchema(schema, job)).toEqual({
        general: {
          id: 'test'
        }
      });
    });
  });

  describe('#createJobSpecFromJob', function () {

    it('should create the correct job', function () {
      const job = new Job({
        id: 'test',
        run: {
          cmd: 'sleep 1000;'
        }
      });

      expect(JobUtil.createJobSpecFromJob(job)).toEqual(
        {
          id: 'test',
          description: null,
          run: {
            cmd: 'sleep 1000;',
            cpus: 0.01,
            mem: 32,
            disk: 0
          }
        });
    });

    it('should add concurrencyPolicy if schedule is defined', function () {
      const job = new Job({
        id: 'test',
        run: {
          cmd: 'sleep 1000;'
        },
        schedules: [{
          id: 'every-minute',
          cron: '* * * * *'
        }]
      });

      expect(JobUtil.createJobSpecFromJob(job).schedules[0]).toEqual(
        {
          id: 'every-minute',
          concurrencyPolicy: 'ALLOW',
          cron: '* * * * *'
        });
    });
  });
});
