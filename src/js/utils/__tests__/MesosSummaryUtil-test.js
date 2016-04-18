jest.dontMock('../../config/Config');
jest.dontMock('../../stores/MarathonStore');
jest.dontMock('../Maths');
jest.dontMock('../MesosSummaryUtil');
jest.dontMock('../Util');

let MesosSummaryUtil = require('../MesosSummaryUtil');
let SummaryList = require('../../structs/SummaryList');
let StateSummary = require('../../structs/StateSummary');

describe('MesosSummaryUtil', function () {

  describe('#stateResourcesToResourceStates', function () {

    it('returns empty resource states lists', function () {
      let resourceStates = MesosSummaryUtil.stateResourcesToResourceStates([]);
      expect(resourceStates).toEqual({cpus: [], mem: [], disk: []});
    });

    it('sets fields to null indicating unsuccessful snapshot', function () {
      let stateResources = [
        {
          date: 1,
          resources: null,
          totalResources: null
        }, {
          date: 2,
          resources: {cpus: 7, mem: 3, disk: 4},
          totalResources: {cpus: 10, mem: 3, disk: 4}
        }
      ];
      let resources = MesosSummaryUtil.stateResourcesToResourceStates(stateResources);

      let expectedResult = {
        cpus: [
          {date: 1, percentage: null, value: null},
          {date: 2, percentage: 70, value: 7}
        ],
        mem: [
          {date: 1, percentage: null, value: null},
          {date: 2, percentage: 100, value: 3}
        ],
        disk: [
          {date: 1, percentage: null, value: null},
          {date: 2, percentage: 100, value: 4}
        ]
     };

      expect(resources).toEqual(expectedResult);
    });

    it('transposes state resources to resource states', function () {
      let stateResources = [{
        date: 1,
        resources: {cpus: 2, mem: 3, disk: 2},
        totalResources: {cpus: 4, mem: 3, disk: 4}
      }];
      let resourceStates = MesosSummaryUtil.stateResourcesToResourceStates(
        stateResources
      );

      let expectedResult = {
        cpus: [{date: 1, value: 2, percentage: 50}],
        mem: [{date: 1, value: 3, percentage: 100}],
        disk: [{date: 1, value: 2, percentage: 50}]
      };

      expect(resourceStates).toEqual(expectedResult);
    });

    it('transposes multiple state resources to resource states', function () {
      let stateResources = [
        {
          date: 1,
          resources: {cpus: 2, mem: 3, disk: 2},
          totalResources: {cpus: 4, mem: 3, disk: 4}
        }, {
          date: 2,
          resources: {cpus: 7, mem: 3, disk: 4},
          totalResources: {cpus: 10, mem: 3, disk: 4}
        }
      ];
      let resourceStates = MesosSummaryUtil.stateResourcesToResourceStates(
        stateResources
      );

      let expectedResult = {
        cpus: [
          {date: 1, value: 2, percentage: 50},
          {date: 2, value: 7, percentage: 70}
        ],
        mem: [
          {date: 1, value: 3, percentage: 100},
          {date: 2, value: 3, percentage: 100}
        ],
        disk: [
          {date: 1, value: 2, percentage: 50},
          {date: 2, value: 4, percentage: 100}
        ]
      };

      expect(resourceStates).toEqual(expectedResult);
    });

  });

  describe('#failureRateReturnsEpochDate', function () {

    let snapshot = {frameworks: []};
    let states = new SummaryList();
    states.addSnapshot(snapshot, Date.now());
    let epochDate = MesosSummaryUtil.getFailureRate(states.list[0], states.list[0]).date;

    it('returns a number', function () {
      expect(typeof epochDate).toEqual('number');
    });

    it('returns a valid epoch time', function () {
      let date = new Date(epochDate);
      expect(isNaN(date.getTime())).toEqual(false);
    });

    it('returns null for rate if state is unsuccessful', function () {
      let unsuccessfulState = new StateSummary({successful: false});
      let result = MesosSummaryUtil.getFailureRate(
        unsuccessfulState,
        states.list[0]
      ).rate;

      expect(result).toEqual(null);
    });

    it('returns a number for rate if state is successful', function () {
      let successfulState = new StateSummary({successful: true});
      let result = MesosSummaryUtil.getFailureRate(
        successfulState,
        states.list[0]
      ).rate;

      expect(typeof result).toEqual('number');
    });
  });
});
