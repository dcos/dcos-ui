import NotificationStore from "#SRC/js/stores/NotificationStore";
import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

import Config from "#SRC/js/config/Config";

import * as ActionTypes from "../../constants/ActionTypes";
const EventTypes = require("../../constants/EventTypes");
const secretsFixture = require("../../../../tests/_fixtures/secrets/secrets.json");
const storesFixture = require("../../../../tests/_fixtures/secrets/stores.json");
const secretFixture = require("../../../../tests/_fixtures/secrets/secret.json");

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

const SecretsReducer = require("../../Reducer");
const getSecretStore = require("../SecretStore").default;

const SecretStore = getSecretStore();
PluginSDK.__addReducer("secrets", SecretsReducer);

let thisRequestFn,
  thisSecretsFixture,
  thisUseFixtures,
  thisPrevGetCount,
  thisPrevRemove,
  thisPrevAdd,
  thisPrevGet,
  thisResult;

describe("SecretStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = (handlers) => {
      handlers.success(secretsFixture);
    };
    thisSecretsFixture = {
      ...secretsFixture,
    };
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns all of the secrets it was given", () => {
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;

    SecretStore.fetchSecrets();
    jest.runAllTimers();
    const secrets = SecretStore.get("secrets");
    expect(secrets.length).toEqual(thisSecretsFixture.array.length);

    Config.useFixtures = thisUseFixtures;
  });

  describe("processSecrets", () => {
    it("stores secrets when event is dispatched", () => {
      SDK.dispatch({
        type: EventTypes.SECRET_STORE_SECRETS_SUCCESS,
        secrets: secretsFixture.array,
      });

      let secrets = SecretStore.get("secrets");
      expect(secrets[0]).toEqual("a/list");
    });

    it("dispatches the correct event upon secret request success", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_STORE_SECRETS_SUCCESS,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_STORE_SECRETS_SUCCESS,
        data: secretsFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon secret request error", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_STORE_SECRETS_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_STORE_SECRETS_ERROR,
        data: "foo",
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("processSecretDetail", () => {
    it("stores secretDetail when event is dispatched", () => {
      SDK.dispatch({
        type: EventTypes.SECRET_STORE_SECRET_SUCCESS,
        secretDetail: secretFixture,
      });

      const secret = SecretStore.get("secretDetail");
      expect(secret.value).toEqual("thisisasecretvalue2016");
    });

    it("dispatches the correct event upon secret request success", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_STORE_SECRET_SUCCESS,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_STORE_SECRET_SUCCESS,
        data: secretFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon secret request error", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_STORE_SECRET_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_STORE_SECRET_ERROR,
        data: secretFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });

  describe("processStores", () => {
    beforeEach(() => {
      thisPrevGetCount = NotificationStore.getNotificationCount;
      thisPrevRemove = NotificationStore.removeNotification;
      thisPrevAdd = NotificationStore.addNotification;
    });

    afterEach(() => {
      NotificationStore.getNotificationCount = thisPrevGetCount;
      NotificationStore.removeNotification = thisPrevRemove;
      NotificationStore.addNotification = thisPrevAdd;
    });

    it("stores stores when event is dispatched", () => {
      SDK.dispatch({
        type: EventTypes.SECRET_ALL_STORES_SUCCESS,
        stores: storesFixture.array,
      });

      let stores = SecretStore.get("stores");
      expect(stores.length).toEqual(storesFixture.array.length);
    });

    it("dispatches the correct event upon secret request success", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_ALL_STORES_SUCCESS,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ALL_STORES_SUCCESS,
        data: storesFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon secret request error", () => {
      const mockedFn = jest.fn();
      SecretStore.addChangeListener(
        EventTypes.SECRET_ALL_STORES_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_ALL_STORES_ERROR,
        data: storesFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("removes notification if there are no stores sealed", () => {
      NotificationStore.removeNotification = jasmine.createSpy();
      NotificationStore.getNotificationCount = () => 1;

      SecretStore.processStores(storesFixture.array);
      expect(NotificationStore.removeNotification).toHaveBeenCalled();
    });

    it("creates a notification if there are stores sealed", () => {
      NotificationStore.addNotification = jasmine.createSpy();
      SecretStore.processStores({
        array: [{ sealed: true }],
      });

      expect(NotificationStore.addNotification).toHaveBeenCalled();
    });
  });

  describe("getSecrets", () => {
    beforeEach(() => {
      thisPrevGet = SecretStore.get;
      SecretStore.get = () => ["a/list", "of/paths", "to/somewhere/magical"];
      thisResult = SecretStore.getSecrets();
    });

    afterEach(() => {
      SecretStore.get = thisPrevGet;
    });

    it("has 3 items", () => {
      expect(thisResult.length).toEqual(3);
    });

    it("creates Secrets with the paths", () => {
      expect(thisResult[0].getPath()).toEqual("a/list");
    });
  });
});
