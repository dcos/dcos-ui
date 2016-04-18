var _ = require('underscore');

jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../MesosSummaryStore');
jest.dontMock('./fixtures/MockStates.json');
jest.dontMock('./fixtures/MockAppMetadata');
jest.dontMock('./fixtures/MockParsedAppMetadata');
jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../utils/RequestUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../utils/Util');

var MesosSummaryStore = require('../MesosSummaryStore');
var MockStates = require('./fixtures/MockStates.json');
var Service = require('../../structs/Service');

MesosSummaryStore.init();

describe('Mesos State Store', function () {

  describe('#getTaskFailureRate', function () {

    beforeEach(function () {
      MesosSummaryStore.processSummary(MockStates.oneTaskRunning);
      // Necessary because prevMesosStatesMap is only set by getFailureRate.
      MesosSummaryStore.get('taskFailureRates');
    });

    it('is 0% initially', function () {
      var taskFailureRate = MesosSummaryStore.get('taskFailureRate');
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });

    it('is 0% when one task finishes', function () {
      MesosSummaryStore.processSummary(MockStates.oneTaskFinished);
      var taskFailureRate = MesosSummaryStore.get('taskFailureRate');
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });

    it('is 100% when one task fails', function () {
      MesosSummaryStore.processSummary(MockStates.oneTaskFailed);
      var taskFailureRate = MesosSummaryStore.get('taskFailureRate');
      expect(_.last(taskFailureRate).rate).toEqual(100);
    });

    it('is 0% when one task is killed', function () {
      MesosSummaryStore.processSummary(MockStates.oneTaskKilled);
      var taskFailureRate = MesosSummaryStore.get('taskFailureRate');
      expect(_.last(taskFailureRate).rate).toEqual(0);
    });
  });

  describe('#hasServiceUrl', function () {
    beforeEach(function () {
      this.getServiceFromName = MesosSummaryStore.getServiceFromName;
      MesosSummaryStore.getServiceFromName = function (hasUrl) {
        if (hasUrl === 'name_of_service_with_url') {
          return new Service({
            name: 'fake_service',
            webui_url: 'http://google.com'
          });
        }

        return new Service({
          name: 'fake_service'
        });
      };
    });

    afterEach(function () {
      MesosSummaryStore.getServiceFromName = this.getServiceFromName;
    });

    it('returns true if service has a web url', function () {
      var hasUrl = MesosSummaryStore.hasServiceUrl('name_of_service_with_url');

      expect(hasUrl).toEqual(true);
    });

    it('returns false if service does not have a web url', function () {
      var hasUrl = MesosSummaryStore.hasServiceUrl('name_of_service_without_url');

      expect(hasUrl).toEqual(false);
    });
  });

});
