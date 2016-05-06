jest.dontMock('../ServicePlanStore');
jest.dontMock('../../structs/ServicePlan');
jest.dontMock('../../mixins/GetSetMixin');

import ActionTypes from '../../constants/ActionTypes';
import AppDispatcher from '../../events/AppDispatcher';
import EventTypes from '../../constants/EventTypes';
import ServicePlan from '../../structs/ServicePlan';
// es6 import gets mocked for store
let ServicePlanStore = require('../ServicePlanStore');

describe('ServicePlanStore', function () {

  describe('#addPlanChangeListener', function () {

    it('invokes change listeners for a service plan', function () {
      let mockFn = jest.fn();
      let mockFn2 = jest.fn();
      ServicePlanStore.addPlanChangeListener('/kafka', mockFn);
      ServicePlanStore.addPlanChangeListener('/kafka', mockFn2);
      ServicePlanStore.addPlanChangeListener('/cassandra', mockFn);

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Complete',
          phases: []
        },
        serviceID: '/kafka'
      });

      expect(mockFn.mock.calls.length).toEqual(1);
      expect(mockFn2.mock.calls.length).toEqual(1);
      expect(mockFn.mock.calls[0][0] instanceof ServicePlan);
      expect(mockFn.mock.calls[0][0].isComplete()).toEqual(true);
    });

  });

  describe('#removePlanChangeListener', function () {

    it('removes change listener for a service plan', function () {
      let mockFn = jest.fn();
      let mockFn2 = jest.fn();
      ServicePlanStore.addPlanChangeListener('/kafka', mockFn);
      ServicePlanStore.addPlanChangeListener('/kafka', mockFn2);

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Complete',
          phases: []
        },
        serviceID: '/kafka'
      });

      expect(mockFn.mock.calls.length).toEqual(1);
      expect(mockFn2.mock.calls.length).toEqual(1);

      ServicePlanStore.removePlanChangeListener('/kafka', mockFn);

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Complete',
          phases: []
        },
        serviceID: '/kafka'
      });

      expect(mockFn.mock.calls.length).toEqual(1);
      expect(mockFn2.mock.calls.length).toEqual(2);
    });

  });

  describe('#getServicePlan', function () {

    it('should return instance of ServicePlan if exists', function () {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Complete',
          phases: []
        },
        serviceID: '/kafka'
      });

      expect(ServicePlanStore.getServicePlan('/kafka') instanceof ServicePlan)
        .toEqual(true);
    });

    it('should return null if service plan does not exist', function () {
      expect(ServicePlanStore.getServicePlan('/cassandra')).toEqual(null);
    });

  });

  describe('#processPlanFetchSuccess', function () {

    it('should store service plans', function () {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Complete',
          phases: []
        },
        serviceID: '/kafka'
      });
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
        data: {
          status: 'Waiting',
          phases: []
        },
        serviceID: '/cassandra'
      });

      expect(ServicePlanStore.getServicePlan('/kafka').isComplete()).toEqual(true);
      expect(ServicePlanStore.getServicePlan('/cassandra').isWaiting()).toEqual(true);
    });

  });

  describe('#processPlanDecisionSuccess', function () {

    it('should fetch plan after successful command response', function () {
      spyOn(ServicePlanStore, 'fetchPlan');

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_PLAN_DECISION_SUCCESS,
        serviceID: '/kafka'
      });

      expect(ServicePlanStore.fetchPlan).toHaveBeenCalled();
    });

  });

  describe('dispatcher', function () {

    describe('fetch', function () {

      it('dispatches the correct event upon success', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the serviceID with event upon success', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_FETCH_SUCCESS,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls[0][0]).toEqual('/kafka');
      });

      it('dispatches the correct event upon error', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_FETCH_ERROR,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the error & serviceID with event upon error', function () {
        let error = {err: 'error'};
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_FETCH_ERROR,
          data: error,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls[0][0]).toEqual(error);
        expect(mockedFn.mock.calls[0][1]).toEqual('/kafka');
      });

    });

    describe('decision', function () {

      it('dispatches the correct event upon success', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_DECISION_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_DECISION_SUCCESS,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the serviceID with event upon success', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_DECISION_SUCCESS,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_DECISION_SUCCESS,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls[0][0]).toEqual('/kafka');
      });

      it('dispatches the correct event upon error', function () {
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_DECISION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_DECISION_ERROR,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the error & serviceID with event upon error', function () {
        let error = {err: 'error'};
        let mockedFn = jest.fn();
        ServicePlanStore.addChangeListener(
          EventTypes.PLAN_DECISION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_PLAN_DECISION_ERROR,
          data: error,
          serviceID: '/kafka'
        });

        expect(mockedFn.mock.calls[0][0]).toEqual(error);
        expect(mockedFn.mock.calls[0][1]).toEqual('/kafka');
      });

    });

  });

});
