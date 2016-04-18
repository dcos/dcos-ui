var _ = require('underscore');

jest.dontMock('../../constants/ActionTypes');
jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');
jest.dontMock('../MesosSummaryActions');
jest.dontMock('../../utils/RequestUtil');
jest.dontMock('../../constants/TimeScales');

import {Hooks} from 'PluginSDK';
import PluginTestUtils from 'PluginTestUtils';

PluginTestUtils.loadPluginsByName({
  tracking: {enabled: true}
});

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var MesosSummaryActions = require('../MesosSummaryActions');
var RequestUtil = require('../../utils/RequestUtil');
var TimeScales = require('../../constants/TimeScales');

global.analytics = {
  initialized: true,
  track: _.noop,
  log: _.noop
};

describe('Mesos State Actions', function () {

  beforeEach(function () {
    Config.historyServer = 'http://historyserver';
    Config.rootUrl = 'http://mesosserver';
    spyOn(RequestUtil, 'json');
  });

  describe('#fetchSummary', function () {
    it('fetches the most recent state by default', function () {
      MesosSummaryActions.fetchSummary();
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.mostRecentCall.args[0].url).toEqual('http://historyserver/dcos-history-service/history/last');
    });

    it('fetches a whole minute when instructed', function () {
      MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.mostRecentCall.args[0].url).toEqual('http://historyserver/dcos-history-service/history/minute');
    });

    it('fetches a whole hour when instructed', function () {
      MesosSummaryActions.fetchSummary(TimeScales.HOUR);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.mostRecentCall.args[0].url).toEqual('http://historyserver/dcos-history-service/history/hour');
    });

    it('fetches a whole day when instructed', function () {
      MesosSummaryActions.fetchSummary(TimeScales.DAY);
      expect(RequestUtil.json).toHaveBeenCalled();
      expect(RequestUtil.json.mostRecentCall.args[0].url).toEqual('http://historyserver/dcos-history-service/history/day');
    });

    describe('When the history server is offline', function () {

      beforeEach(function () {
        spyOn(AppDispatcher, 'handleServerAction');
        RequestUtil.json.andCallFake(function (req) {
          req.error({ message: 'Guru Meditation' });
        });
      });

      afterEach(function () {
        // Clean up debouncing
        RequestUtil.json.andCallFake(function (req) {
          req.success();
        });
        MesosSummaryActions.fetchSummary();
      });

      it('detects errors on the history server', function () {
        MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
        expect(AppDispatcher.handleServerAction).toHaveBeenCalled();
        expect(AppDispatcher.handleServerAction.mostRecentCall.args[0].type)
          .toEqual(ActionTypes.REQUEST_MESOS_HISTORY_ERROR);
      });

      it('falls back to the Mesos endpoint if the history service is offline on initial fetch', function () {
        MesosSummaryActions.fetchSummary(TimeScales.MINUTE);
        expect(RequestUtil.json).toHaveBeenCalled();
        expect(RequestUtil.json.mostRecentCall.args[0].url).toContain('http://mesosserver/mesos/master/state-summary');
      });

      it('falls back to the Mesos endpoint if the history service goes offline', function () {
        MesosSummaryActions.fetchSummary();
        expect(RequestUtil.json).toHaveBeenCalled();
        expect(RequestUtil.json.mostRecentCall.args[0].url).toContain('http://mesosserver/mesos/master/state-summary');
      });

    });

  });

});
