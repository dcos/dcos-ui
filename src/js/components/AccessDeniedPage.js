import React from "react";

import AuthStore from "../stores/AuthStore";
import AlertPanel from "./AlertPanel";
import AlertPanelHeader from "./AlertPanelHeader";
import Config from "../config/Config";
import MetadataStore from "../stores/MetadataStore";

const METHODS_TO_BIND = ["handleUserLogout"];

module.exports = class AccessDeniedPage extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleUserLogout() {
    AuthStore.logout();
  }

  getFooter() {
    return (
      <div className="button-collection flush-bottom">
        <button
          className="button button-primary"
          onClick={this.handleUserLogout}
        >
          Log out
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
              <AlertPanelHeader>Access denied</AlertPanelHeader>
              <p className="tall">
                {"You do not have access to this service. Please contact your "}
                {Config.productName}
                {" administrator or see "}
                <a
                  href={MetadataStore.buildDocsURI(
                    "/administration/id-and-access-mgt/"
                  )}
                  target="_blank"
                >
                  security documentation
                </a> for more information.
              </p>
              {this.getFooter()}
            </AlertPanel>
          </div>
        </div>
      </div>
    );
  }
};
