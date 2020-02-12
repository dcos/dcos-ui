import { RequestUtil } from "mesosphere-shared-reactjs";

import AppDispatcher from "#SRC/js/events/AppDispatcher";
import Config from "#SRC/js/config/Config";

import PrivatePluginsConfig from "../../PrivatePluginsConfig";
import * as ActionTypes from "../constants/ActionTypes";

import SDK from "PluginSDK";

const CertificateActions = {
  fetchCertificates: RequestUtil.debounceOnError(
    Config.getRefreshRate(),
    (resolve, reject) => () => {
      RequestUtil.json({
        url: `${Config.rootUrl}${PrivatePluginsConfig.certificatesAPIPrefix}/certificates`,
        method: "POST",
        data: { serial: "", authority_key_id: "", expired_ok: true },
        success(response) {
          SDK.dispatch({
            type: ActionTypes.REQUEST_ALL_CERTIFICATES_SUCCESS,
            data: response
          });
          resolve();
        },
        error(xhr) {
          SDK.dispatch({
            type: ActionTypes.REQUEST_ALL_CERTIFICATES_ERROR,
            data: RequestUtil.getErrorFromXHR(xhr)
          });
          reject();
        },
        hangingRequestCallback() {
          AppDispatcher.handleServerAction({
            type: ActionTypes.REQUEST_ALL_CERTIFICATES_ONGOING
          });
        }
      });
    },
    { delayAfterCount: Config.delayAfterErrorCount }
  )
};

if (Config.useFixtures) {
  const certificatesFixturePromise = import(
    /* certificates */ "../../../tests/_fixtures/secrets/certificates.json"
  );

  if (!window.actionTypes) {
    window.actionTypes = {};
  }

  if (!window.actionTypes.CertificateActions) {
    window.actionTypes.CertificateActions = {};
  }

  certificatesFixturePromise.then(certificatesFixture => {
    window.actionTypes.CertificateActions.fetchCertificates = {
      event: "success",
      success: { response: certificatesFixture }
    };

    Object.keys(window.actionTypes.CertificateActions).forEach(method => {
      CertificateActions[method] = RequestUtil.stubRequest(
        CertificateActions,
        "CertificateActions",
        method
      );
    });
  });
}

export default CertificateActions;
