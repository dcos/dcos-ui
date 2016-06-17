import React from 'react';
import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';
import {Modal} from 'reactjs-components';

let SDK = require('../SDK').getSDK();

let {AuthStore, MetadataStore} =
  SDK.get(['AuthStore', 'MetadataStore']);

let METHODS_TO_BIND = [
  'handleModalClose',
  'onMessageReceived'
];

class LoginPage extends mixin(StoreMixin) {
  componentWillMount() {
    super.componentWillMount();

    if (AuthStore.getUser()) {
      this.context.router.transitionTo('/');
    }

    this.store_listeners = [
      {
        name: 'auth',
        events: ['success', 'error'],
        suppressUpdate: true
      }
    ];

    this.state = {
      showClusterError: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    window.addEventListener('message', this.onMessageReceived);
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    window.removeEventListener('message', this.onMessageReceived);
  }

  onMessageReceived(event) {
    if (event.origin !== SDK.config.authHost) {
      return;
    }

    let data = JSON.parse(event.data);

    switch (data.type) {
      case 'token':
        AuthStore.login({token: data.token});
        break;
      case 'error':
        this.navigateToAccessDenied();
        break;
    }
  }

  onAuthStoreError(message, xhr) {
    if (xhr.status >= 400 && xhr.status < 500) {
      this.navigateToAccessDenied();
    } else {
      this.setState({showClusterError: true});
    }
  }

  handleModalClose() {
    this.setState({showClusterError: false});
  }

  navigateToAccessDenied() {
    let router = this.context.router;

    router.transitionTo('/access-denied');
  }

  render() {
    let firstUser = SDK.Store.getAppState()
      .config.config.clusterConfiguration.firstUser;

    let location = `/login?firstUser=${firstUser}`;

    return (
      <div>
        <div className="iframe-page-container">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            id="oauth-iframe"
            src={location} />
        </div>
        <Modal
          maxHeightPercentage={0.9}
          onClose={this.handleModalClose}
          open={this.state.showClusterError}
          showCloseButton={true}
          showHeader={false}
          showFooter={false}>
          <p className="text-align-center">
            Unable to login to your DC/OS cluster. Clusters must be connected to the internet.
          </p>
          <p className="flush-bottom text-align-center">
            Please contact your system administrator or see the <a href={MetadataStore.buildDocsURI('/administration/installing/')} target="_blank">documentation.</a>
          </p>
        </Modal>
      </div>
    );
  }
}

LoginPage.contextTypes = {
  router: React.PropTypes.func
};

module.exports = LoginPage;

