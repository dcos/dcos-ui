jest.dontMock('../ServicePlanActions');

import ActionTypes from '../../constants/ActionTypes';
import AppDispatcher from '../../events/AppDispatcher';
import Config from '../../config/Config';
import ServicePlanActions from '../ServicePlanActions';
import RequestUtil from '../../utils/RequestUtil';

describe('ServicePlanActions', function () {

  describe('#fetchPlan', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      ServicePlanActions.fetchPlan('/kafka');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/kafka${Config.servicePlanAPIPath}`
      );
    });

    it('dispatches the correct action when successful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.type)
          .toEqual(ActionTypes.REQUEST_PLAN_FETCH_SUCCESS);
      });

      this.configuration.success();
    });

    it('dispatches the correct action when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.type)
          .toEqual(ActionTypes.REQUEST_PLAN_FETCH_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct error when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

  describe('#sendDecisionCommand', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      ServicePlanActions.sendDecisionCommand('continue', '/kafka');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('executes a PUT request', function () {
      expect(this.configuration.method).toEqual('PUT');
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/service/kafka${Config.servicePlanAPIPath}?cmd=continue`
      );
    });

    it('dispatches the correct action when successful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.type)
          .toEqual(ActionTypes.REQUEST_PLAN_DECISION_SUCCESS);
      });

      this.configuration.success();
    });

    it('dispatches the correct action when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.type)
          .toEqual(ActionTypes.REQUEST_PLAN_DECISION_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct error when unsuccessful', function () {
      let id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

});
