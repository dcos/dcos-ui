import { Trans } from "@lingui/macro";
import * as React from "react";

import AuthStore from "../stores/AuthStore";
import AlertPanel from "./AlertPanel";
import AlertPanelHeader from "./AlertPanelHeader";
import Config from "../config/Config";
import MetadataStore from "../stores/MetadataStore";

export default class AccessDeniedPage extends React.Component {
  handleUserLogout = () => {
    AuthStore.logout();
  };

  getFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button
          className="button button-primary"
          onClick={this.handleUserLogout}
        >
          <Trans>Log out</Trans>
        </button>
      </div>
    );
  }

  render() {
    return (
      <div className="application-wrapper">
        <div className="page">
          <div className="page-body-content vertical-center flex-item-grow-1">
            <AlertPanel>
              <AlertPanelHeader>
                <Trans>Access denied</Trans>
              </AlertPanelHeader>
              <Trans render="p" className="tall">
                You do not have access to this service. Please contact your{" "}
                {Config.productName} administrator or see{" "}
                <a
                  href={MetadataStore.buildDocsURI("/security/ent/iam-api/")}
                  target="_blank"
                >
                  security documentation
                </a>{" "}
                for more information.
              </Trans>
              {this.getFooter()}
            </AlertPanel>
          </div>
        </div>
      </div>
    );
  }
}
