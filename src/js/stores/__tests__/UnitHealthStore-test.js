jest.dontMock('../UnitHealthStore');
jest.dontMock('../../config/Config');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/UnitHealthActions');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../../../tests/_fixtures/unit-health/units.json');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../../events/AppDispatcher');
var Config = require('../../config/Config');
var EventTypes = require('../../constants/EventTypes');
var HealthUnitsList = require('../../structs/HealthUnitsList');
var UnitHealthStore = require('../UnitHealthStore');
var unitsFixture = require('../../../../tests/_fixtures/unit-health/units.json');

describe('UnitHealthStore', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function (handlers) {
      handlers.success(unitsFixture);
    };
    this.unitsFixture = Object.assign({}, unitsFixture);
  });

  afterEach(function () {
    RequestUtil.json = this.requestFn;
  });

  it('should return an instance of HealthUnitsList', function () {
    Config.useFixtures = true;
    UnitHealthStore.fetchUnits();
    var units = UnitHealthStore.getUnits('units');
    expect(units instanceof HealthUnitsList).toBeTruthy();
    Config.useFixtures = false;
  });

  it('should return all of the units it was given', function () {
    Config.useFixtures = true;
    UnitHealthStore.fetchUnits();
    var units = UnitHealthStore.getUnits().getItems();
    expect(units.length).toEqual(this.unitsFixture.units.length);
    Config.useFixtures = false;
  });

  describe('dispatcher', function () {

    it('stores units when event is dispatched', function () {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS,
        data: [
          {
            'id': 'mesos',
            'name': 'Mesos',
            'version': '0.27.1',
            'health': 3
          }
        ]
      });

      var units = UnitHealthStore.getUnits().getItems();
      expect(units[0].id).toEqual('mesos');
      expect(units[0].name).toEqual('Mesos');
    });

    it('dispatches the correct event upon success', function () {
      var mockedFn = jasmine.createSpy();
      UnitHealthStore.addChangeListener(EventTypes.HEALTH_UNITS_CHANGE, mockedFn);
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS,
        data: []
      });

      expect(mockedFn.calls.count()).toEqual(2);
    });

    it('dispatches the correct event upon error', function () {
      var mockedFn = jasmine.createSpy();
      UnitHealthStore.addChangeListener(
        EventTypes.HEALTH_UNITS_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_ERROR,
        data: 'foo'
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(['foo']);
    });

  });
});
