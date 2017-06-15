import React from "react";
import { routerShape } from "react-router";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Modal } from "reactjs-components";

const SDK = require("../SDK").getSDK();

const { AuthStore, MetadataStore } = SDK.get(["AuthStore", "MetadataStore"]);

const METHODS_TO_BIND = ["handleModalClose", "onMessageReceived"];

class LoginPage extends mixin(StoreMixin) {
  componentWillMount() {
    super.componentWillMount();

    if (AuthStore.getUser()) {
      this.context.router.push("/");
    }

    this.store_listeners = [
      {
        name: "auth",
        events: ["success", "error"],
        suppressUpdate: true
      }
    ];

    this.state = {
      showClusterError: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    global.addEventListener("message", this.onMessageReceived);
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    global.removeEventListener("message", this.onMessageReceived);
  }

  onMessageReceived(event) {
    if (event.origin !== SDK.config.authHost) {
      console.warn(
        `Event Origin "${event.origin}" does not match allowed origin "${SDK.config.authHost}"`
      );

      return;
    }

    const data = JSON.parse(event.data);

    switch (data.type) {
      case "token":
        AuthStore.login({ token: data.token });
        break;
      case "error":
        this.navigateToAccessDenied();
        break;
    }
  }

  onAuthStoreError(message, xhr) {
    if (xhr.status >= 400 && xhr.status < 500) {
      this.navigateToAccessDenied();
    } else {
      this.setState({ showClusterError: true });
    }
  }

  handleModalClose() {
    this.setState({ showClusterError: false });
  }

  navigateToAccessDenied() {
    const router = this.context.router;

    router.replace("/access-denied");
  }

  render() {
    const firstUser = SDK.Store.getAppState().config.config.clusterConfiguration
      .firstUser;

    const location = `/login?firstUser=${firstUser}`;

    return (
      <div>
        <div className="iframe-page-container">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            id="oauth-iframe"
            src={location}
          />
        </div>
        <Modal
          onClose={this.handleModalClose}
          open={this.state.showClusterError}
          showCloseButton={true}
          showHeader={false}
          showFooter={false}
        >
          <p className="text-align-center">
            Unable to login to your DC/OS cluster. Clusters must be connected to the internet.
          </p>
          <p className="flush-bottom text-align-center">
            {"Please contact your system administrator or see the "}
            <a
              href={MetadataStore.buildDocsURI("/administration/installing/")}
              target="_blank"
            >
              documentation
            </a>.
          </p>
        </Modal>
      </div>
    );
  }
}

LoginPage.contextTypes = {
  router: routerShape
};

module.exports = LoginPage;
