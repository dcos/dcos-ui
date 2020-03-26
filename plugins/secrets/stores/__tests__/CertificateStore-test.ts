import * as ActionTypes from "../../constants/ActionTypes";
import * as EventTypes from "../../constants/EventTypes";

import PluginSDK from "PluginSDK";

import { RequestUtil } from "mesosphere-shared-reactjs";

const SDK = PluginSDK.__getSDK("secrets", { enabled: true });

require("../../SDK").setSDK(SDK);

const CertificateStore = require("../CertificateStore").default;

import Config from "#SRC/js/config/Config";
const certificatesFixture = require("../../../../tests/_fixtures/secrets/certificates.json")
  .result;
const SecretsReducer = require("../../Reducer");

PluginSDK.__addReducer("secrets", SecretsReducer);

let thisRequestFn, thisCertificatesFixture, thisUseFixtures;

describe("CertificateStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = (handlers) => {
      handlers.success(certificatesFixture);
    };
    thisCertificatesFixture = certificatesFixture.slice();
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
  });

  it("returns all of the certificates it was given", () => {
    SDK.dispatch({
      type: EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS,
      certificates: { result: certificatesFixture },
    });

    let certificates = CertificateStore.get("certificates");

    expect(certificates.length).toEqual(thisCertificatesFixture.length);

    Config.useFixtures = thisUseFixtures;
  });

  it("dispatches correct event on error", () => {
    RequestUtil.json = (handlers) => {
      handlers.error();
    };
    const mockedFn = jest.fn();
    CertificateStore.addChangeListener(
      EventTypes.CERTIFICATE_ALL_CERTIFICATES_ERROR,
      mockedFn
    );

    SDK.dispatch({
      type: ActionTypes.REQUEST_ALL_CERTIFICATES_ERROR,
      data: certificatesFixture,
    });

    expect(mockedFn.mock.calls.length).toEqual(1);
  });

  describe("processCertificates", () => {
    it("stores certificates when event is dispatched", () => {
      SDK.dispatch({
        type: EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS,
        certificates: { result: certificatesFixture },
      });

      let certificates = CertificateStore.get("certificates");
      expect(certificates[0]).toEqual(thisCertificatesFixture[0]);
    });

    it("dispatches the correct event upon secret request success", () => {
      const mockedFn = jest.fn();
      CertificateStore.addChangeListener(
        EventTypes.CERTIFICATE_ALL_CERTIFICATES_SUCCESS,
        mockedFn
      );

      SDK.dispatch({
        type: ActionTypes.REQUEST_ALL_CERTIFICATES_SUCCESS,
        data: certificatesFixture,
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });
  });
});
