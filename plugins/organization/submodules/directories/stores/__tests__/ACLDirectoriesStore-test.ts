import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLDirectoriesStore = require("../ACLDirectoriesStore").default;
const OrganizationReducer = require("../../../../Reducer");
import * as ActionTypes from "../../constants/ActionTypes";

PluginSDK.__addReducer("organization", OrganizationReducer);

describe("ACLDirectoriesStore dispatcher", () => {
  describe("fetch", () => {
    it("stores directories when event is dispatched", () => {
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORIES_SUCCESS,
        data: [{ foo: "bar" }]
      });

      const directories = ACLDirectoriesStore.getDirectories().getItems();
      expect(directories[0].foo).toEqual("bar");
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORIES_CHANGED,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORIES_SUCCESS,
        data: [{ foo: "bar" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORIES_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORIES_ERROR,
        message: "foo"
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("add", () => {
    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORY_ADD_SUCCESS,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_SUCCESS
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORY_ADD_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORY_ADD_ERROR,
        message: "foo"
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("delete", () => {
    it("removes stored directories after delete", () => {
      ACLDirectoriesStore.processDirectoriesSuccess(["foo"]);
      expect(ACLDirectoriesStore.getDirectories().getItems()).toEqual(["foo"]);

      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_SUCCESS
      });

      expect(ACLDirectoriesStore.getDirectories().getItems()).toEqual([]);
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORY_DELETE_SUCCESS,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_SUCCESS
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jest.fn();
      ACLDirectoriesStore.addChangeListener(
        EventTypes.ACL_DIRECTORY_DELETE_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ACL_DIRECTORY_DELETE_ERROR,
        message: "foo"
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });
});
