import * as EventTypes from "../../constants/EventTypes";

import PluginTestUtils from "PluginTestUtils";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginTestUtils.getSDK("networking", { enabled: true });

require("../../../../SDK").setSDK(SDK);

const NetworkingVIPSummariesStore = require("../NetworkingVIPSummariesStore")
  .default;
import Config from "#SRC/js/config/Config";
import * as ActionTypes from "../../constants/ActionTypes";
const NetworkingReducer = require("../../../../Reducer");
import vipSummariesFixture from "../../../../../../tests/_fixtures/networking/networking-vip-summaries.json";

PluginTestUtils.addReducer("networking", NetworkingReducer);

let thisRequestFn, thisVipSummaries, thisUseFixtures;

describe("NetworkingVIPSummariesStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(vipSummariesFixture);
    };
    thisVipSummaries = {
      ...vipSummariesFixture
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns all of the VIP summaries it was given", () => {
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;

    NetworkingVIPSummariesStore.startFetchVIPSummaries();
    const vipSummaries = NetworkingVIPSummariesStore.get("vipSummaries");

    expect(vipSummaries.length).toEqual(thisVipSummaries.array.length);

    Config.useFixtures = thisUseFixtures;
  });

  describe("processVIPSummaries", () => {
    it("stores VIPs when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
        data: [{ vip: { ip: "foo", port: "bar", protocol: "baz" } }]
      });

      const vipSummaries = NetworkingVIPSummariesStore.get("vipSummaries");

      expect(vipSummaries[0].vip.ip).toEqual("foo");
      expect(vipSummaries[0].vip.port).toEqual("bar");
      expect(vipSummaries[0].vip.protocol).toEqual("baz");
    });

    it("dispatches the correct event upon VIP request success", () => {
      const mockedFn = jest.fn();
      NetworkingVIPSummariesStore.addChangeListener(
        EventTypes.NETWORKING_VIP_SUMMARIES_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_SUMMARIES_SUCCESS,
        data: [{ vip: { ip: "foo", port: "bar", protocol: "baz" } }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("processVIPSummariesError", () => {
    it("dispatches the correct event upon VIP request error", () => {
      const mockedFn = jasmine.createSpy();
      NetworkingVIPSummariesStore.addChangeListener(
        EventTypes.NETWORKING_VIP_SUMMARIES_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_VIP_SUMMARIES_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
