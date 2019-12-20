import AppDispatcher from "../../events/AppDispatcher";
import HealthUnitsList from "../../structs/HealthUnitsList";
import UnitHealthStore from "../UnitHealthStore";
import * as EventTypes from "../../constants/EventTypes";

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const Config = require("#SRC/js/config/Config").default;
const unitsFixture = require("../../../../tests/_fixtures/unit-health/units.json");

let thisRequestFn, thisUnitsFixture;

describe("UnitHealthStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(unitsFixture);
    };
    thisUnitsFixture = {
      ...unitsFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns an instance of HealthUnitsList", () => {
    Config.useFixtures = true;
    UnitHealthStore.fetchUnits();
    const units = UnitHealthStore.getUnits("units");
    expect(units instanceof HealthUnitsList).toBeTruthy();
    Config.useFixtures = false;
  });

  it("returns all of the units it was given", () => {
    Config.useFixtures = true;
    UnitHealthStore.fetchUnits();
    const units = UnitHealthStore.getUnits().getItems();
    expect(units.length).toEqual(thisUnitsFixture.units.length);
    Config.useFixtures = false;
  });

  describe("dispatcher", () => {
    it("stores units when event is dispatched", () => {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS,
        data: [
          {
            id: "mesos",
            name: "Mesos",
            version: "0.27.1",
            health: 3
          }
        ]
      });

      const units = UnitHealthStore.getUnits().getItems();
      expect(units[0].id).toEqual("mesos");
      expect(units[0].name).toEqual("Mesos");
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jasmine.createSpy();
      UnitHealthStore.addChangeListener(
        EventTypes.HEALTH_UNITS_CHANGE,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_SUCCESS,
        data: []
      });

      expect(mockedFn.calls.count()).toEqual(2);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jasmine.createSpy();
      UnitHealthStore.addChangeListener(
        EventTypes.HEALTH_UNITS_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_HEALTH_UNITS_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
