const TaskStat = require('../TaskStat');

describe('TaskStat', function () {

  describe('#getHealthyTaskCount', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {counts: {}}});

      expect(statistics.getHealthyTaskCount()).toEqual(0);
    });

    it('returns correct number of tasks', function () {
      let statistics = new TaskStat({stats: {counts: {healthy: 5}}});

      expect(statistics.getHealthyTaskCount()).toEqual(5);
    });

  });

  describe('#getRunningTaskCount', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {counts: {}}});

      expect(statistics.getRunningTaskCount()).toEqual(0);
    });

    it('returns correct number of tasks', function () {
      let statistics = new TaskStat({stats: {counts: {running: 10}}});

      expect(statistics.getRunningTaskCount()).toEqual(10);
    });

  });

  describe('#getStagedTaskCount', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {counts: {}}});

      expect(statistics.getStagedTaskCount()).toEqual(0);
    });

    it('returns correct number of tasks', function () {
      let statistics = new TaskStat({stats: {counts: {staged: 2}}});

      expect(statistics.getStagedTaskCount()).toEqual(2);
    });

  });

  describe('#getUnhealthyTaskCount', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {counts: {}}});

      expect(statistics.getUnhealthyTaskCount()).toEqual(0);
    });

    it('returns correct number of tasks', function () {
      let statistics = new TaskStat({stats: {counts: {unhealthy: 3}}});

      expect(statistics.getUnhealthyTaskCount()).toEqual(3);
    });

  });

  describe('#getAverageLifeTime', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {lifeTime: {}}});

      expect(statistics.getAverageLifeTime()).toEqual(0);
    });

    it('returns correct life time', function () {
      let statistics = new TaskStat({stats: {lifeTime: {averageSeconds: 60}}});

      expect(statistics.getAverageLifeTime()).toEqual(60);
    });

  });

  describe('#getMediaLifeTime', function () {

    it('returns defaults to zero (0) if data is undefined', function () {
      let statistics = new TaskStat({});

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it('returns defaults to zero (0) if property is undefined', function () {
      let statistics = new TaskStat({stats: {lifeTime: {}}});

      expect(statistics.getMedianLifeTime()).toEqual(0);
    });

    it('returns correct life time', function () {
      let statistics = new TaskStat({stats: {lifeTime: {medianSeconds: 40}}});

      expect(statistics.getMedianLifeTime()).toEqual(40);
    });

  });

});
