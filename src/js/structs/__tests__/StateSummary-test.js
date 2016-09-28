jest.dontMock('../../../../plugins/services/src/js/structs/Framework');
jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../utils/Util');

const Framework = require('../../../../plugins/services/src/js/structs/Framework');
const NodesList = require('../NodesList');
const ServicesList = require('../../../../plugins/services/src/js/structs/ServicesList');
const StateSummary = require('../StateSummary');

describe('StateSummary', function () {

  describe('#constructor', function () {

    it('constructs a state', function () {
      let instance = new StateSummary();
      expect(instance instanceof StateSummary).toEqual(true);
    });

  });

  describe('#getSnapshotDate', function () {

    it('creates a date when initialized', function () {
      let before = Date.now();
      let instance = new StateSummary();
      let after = Date.now();

      expect(instance.getSnapshotDate() >= before).toBeTruthy();
      expect(instance.getSnapshotDate() <= after).toBeTruthy();
    });

    it('allows us to set the date', function () {
      let date = Date.now();
      let instance = new StateSummary({date});
      expect(instance.getSnapshotDate() === date).toBeTruthy();
    });

  });

  describe('#getActiveSlaves', function () {

    it('returns 0 active slaves by default', function () {
      let instance = new StateSummary();
      expect(instance.getActiveSlaves().length).toEqual(0);
    });

    it('correctly calculates active slaves', function () {
      let snapshot = {
        frameworks: [],
        slaves: [
          {active: true},
          {active: false},
          {active: true}
        ]
      };
      let instance = new StateSummary({snapshot});
      expect(instance.getActiveSlaves().length).toEqual(2);
    });

  });

  describe('#getServiceList', function () {

    it('returns an instance of ServicesList', function () {
      let instance = new StateSummary();
      let services = instance.getServiceList();
      expect(services instanceof ServicesList).toBeTruthy();
    });

    it('ServicesList contains instances of Framework', function () {
      let frameworks = [{a: 1}];
      let instance = new StateSummary({snapshot: {frameworks}});
      let services = instance.getServiceList().getItems();
      expect(services.length).toEqual(1);
      expect(services[0] instanceof Framework).toBeTruthy();
    });

  });

  describe('#getNodesList', function () {

    it('returns an instance of NodesList', function () {
      let instance = new StateSummary();
      let nodes = instance.getNodesList();
      expect(nodes instanceof NodesList).toBeTruthy();
    });

    it('NodesList contains instances of Node', function () {
      let slaves = [{a: 1}];
      let instance = new StateSummary({snapshot: {slaves}});
      let nodes = instance.getNodesList();
      expect(nodes.getItems().length).toEqual(1);
      expect(nodes instanceof NodesList).toBeTruthy();
    });

  });

  describe('#getSlaveTotalResources', function () {

    it('defaults to 0 available resources if there\'s nothing', function () {
      let instance = new StateSummary();
      let defaultSum = {cpus: 0, mem: 0, disk: 0};
      expect(instance.getSlaveTotalResources()).toEqual(defaultSum);
    });

    it('calculates total resources available in slaves', function () {
      let snapshot = {
        frameworks: [],
        slaves: [
          {resources: {cpus: 1, mem: 0, disk: 2}},
          {resources: {cpus: 1, mem: 0, disk: 2}},
          {resources: {cpus: 1, mem: 0, disk: 2}}
        ]
      };
      let aggregate = {cpus: 3, mem: 0, disk: 6};
      let instance = new StateSummary({snapshot});
      expect(instance.getSlaveTotalResources()).toEqual(aggregate);
    });

  });

  describe('#getSlaveUsedResources', function () {

    it('defaults to 0 available resources if there\'s nothing', function () {
      let instance = new StateSummary();
      let defaultSum = {cpus: 0, mem: 0, disk: 0};
      expect(instance.getSlaveUsedResources()).toEqual(defaultSum);
    });

    it('calculates used resources in slaves', function () {
      let snapshot = {
        frameworks: [],
        slaves: [
          {used_resources: {cpus: 1, mem: 0, disk: 2}},
          {used_resources: {cpus: 1, mem: 0, disk: 2}},
          {used_resources: {cpus: 1, mem: 0, disk: 2}}
        ]
      };
      let aggregate = {cpus: 3, mem: 0, disk: 6};
      let instance = new StateSummary({snapshot});
      expect(instance.getSlaveUsedResources()).toEqual(aggregate);
    });

  });

  describe('#getServiceUsedResources', function () {

    it('defaults to 0 available resources if there\'s nothing', function () {
      let instance = new StateSummary();
      let defaultSum = {cpus: 0, mem: 0, disk: 0};
      expect(instance.getServiceUsedResources()).toEqual(defaultSum);
    });

    it('calculates total resources available in slaves', function () {
      let snapshot = {
        frameworks: [
          {used_resources: {cpus: 1, mem: 0, disk: 2}},
          {used_resources: {cpus: 1, mem: 0, disk: 2}},
          {used_resources: {cpus: 1, mem: 0, disk: 2}}
        ],
        slaves: []
      };
      let aggregate = {cpus: 3, mem: 0, disk: 6};
      let instance = new StateSummary({snapshot});
      expect(instance.getServiceUsedResources()).toEqual(aggregate);
    });

  });

});
