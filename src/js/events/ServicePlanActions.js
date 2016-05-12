import {
  REQUEST_PLAN_FETCH_SUCCESS,
  REQUEST_PLAN_FETCH_ERROR,
  REQUEST_PLAN_DECISION_SUCCESS,
  REQUEST_PLAN_DECISION_ERROR
} from '../constants/ActionTypes';

import AppDispatcher from './AppDispatcher';
import Config from '../config/Config';
import RequestUtil from '../utils/RequestUtil';

const ServicePlanActions = {

  fetchPlan: function (serviceID) {
    let uriServiceID = encodeURIComponent(serviceID);
    RequestUtil.json({
      url: `${Config.rootUrl}/service/${uriServiceID}${Config.servicePlanAPIPath}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PLAN_FETCH_SUCCESS,
          data: response,
          serviceID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PLAN_FETCH_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceID
        });
      }
    });
  },

  sendDecisionCommand: function (cmd, serviceID) {
    let uriServiceID = encodeURIComponent(serviceID);
    RequestUtil.json({
      method: 'PUT',
      url: `${Config.rootUrl}/service/${uriServiceID}${Config.servicePlanAPIPath}?cmd=${cmd}`,
      success: function (response) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PLAN_DECISION_SUCCESS,
          data: response,
          serviceID
        });
      },
      error: function (xhr) {
        AppDispatcher.handleServerAction({
          type: REQUEST_PLAN_DECISION_ERROR,
          data: RequestUtil.getErrorFromXHR(xhr),
          serviceID
        });
      }
    });
  }

};

if (Config.useFixtures) {

  let servicePlan = require('../../../tests/_fixtures/plan/plan.json');

  if (!global.actionTypes) {
    global.actionTypes = {};
  }

  global.actionTypes.ServicePlanActions = {
    fetchPlan: {event: 'success', success: {response: servicePlan}},
  };

  Object.keys(global.actionTypes.ServicePlanActions).forEach(function (method) {
    ServicePlanActions[method] = RequestUtil.stubRequest(
      ServicePlanActions, 'ServicePlanActions', method
    );
  });
}

module.exports = ServicePlanActions;
