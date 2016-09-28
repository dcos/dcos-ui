import React from 'react';

import AuthStore from '../stores/AuthStore';
import AlertPanel from './AlertPanel';
import Config from '../config/Config';
import MetadataStore from '../stores/MetadataStore';

const METHODS_TO_BIND = [
  'handleUserLogout'
];

module.exports = class AccessDeniedPage extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleUserLogout() {
    AuthStore.logout();
  }

  getFooter() {
    return (
      <button className="button button-primary"
        onClick={this.handleUserLogout}>
        Log out
      </button>
    );
  }

  render() {
    return (
      <div className="page flex flex-direction-top-to-bottom flex-item-grow-1">
        <div className="page-body-content flex flex-direction-top-to-bottom flex-item-grow-1 horizontal-center vertical-center">
          <AlertPanel
            footer={this.getFooter()}
            title="Access Denied">
            <p>
              You do not have access to this service. <br />
              Please contact your {Config.productName} administrator.
            </p>
            <p className="flush-bottom">
              See the security <a href={MetadataStore.buildDocsURI('/administration/id-and-access-mgt/')} target="_blank">documentation</a> for more information.
            </p>
          </AlertPanel>
        </div>
      </div>
    );
  }
};
