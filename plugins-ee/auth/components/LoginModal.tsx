import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import dcosLogo from "#SRC/img/logo-d2iq-dcos.svg";

import Config from "#SRC/js/config/Config";
import AuthStore from "#SRC/js/stores/AuthStore";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

const SDK = require("../SDK");

class LoginModal extends mixin(StoreMixin) {
  static contextTypes = {
    router: routerShape
  };
  static propTypes = {
    target: PropTypes.string
  };
  constructor() {
    super();

    this.state = {
      disableLogin: false,
      errorMsg: false
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "auth", events: ["success", "error"]},
      // We need to listen for this event so that the component will update when
      // the providers are received.
      {name: "authProviders", events: ["change"]}
    ];
  }

  onAuthStoreError(errorMsg, xhr) {
    const { i18n } = this.props;

    if (xhr.status === 401) {
      errorMsg = i18n._(t`Username and password do not match.`);
    }

    this.setState({
      disableLogin: false,
      errorMsg
    });
  }
  handleLoginSubmit = model => {
    this.setState({
      disableLogin: true,
      errorMsg: false
    });

    AuthStore.login(model, this.props.target);
  };
  handleModalContentUpdate = () => {
    this.forceUpdate();
  };

  getLoginFormDefinition() {
    const { i18n } = this.props;
    const { errorMsg } = this.state;

    return [
      {
        fieldType: "text",
        formGroupClass: classNames("form-group", {
          "form-group-danger": errorMsg
        }),
        name: "uid",
        placeholder: "",
        required: true,
        showError: false,
        showLabel: i18n._(t`Username`),
        writeType: "input",
        validation() {
          return true;
        },
        value: ""
      },
      {
        fieldType: "password",
        formGroupClass: classNames("form-group flush", {
          "form-group-danger": errorMsg
        }),
        name: "password",
        placeholder: "",
        required: true,
        showError: errorMsg,
        showLabel: i18n._(t`Password`),
        writeType: "input",
        validation() {
          return true;
        },
        value: ""
      }
    ];
  }

  getLoginButtonDefinition() {
    const { i18n } = this.props;
    const { disableLogin } = this.state;

    let buttonText = i18n._(t`Log In`);
    if (disableLogin) {
      buttonText = i18n._(t`Logging In...`);
    }

    return [
      {
        text: buttonText,
        className: "button button-primary button-block flush",
        isSubmit: true
      }
    ];
  }

  getModalFooter() {
    return (
      <div className="login-modal-product-name small inverse flush-bottom text-align-center">
        <p>{Config.fullProductName}</p>
        {SDK.getSDK().Hooks.applyFilter("userLoginPolicy", null)}
      </div>
    );
  }

  render() {
    const modalContent = SDK.getSDK().Hooks.applyFilter(
      "loginModalContent",
      null,
      this.handleModalContentUpdate
    );
    const FormModal = require("#SRC/js/components/FormModal").default;

    const modalProps = {
      backdropClass: "modal-backdrop login-modal-backdrop",
      subHeader: (
        <img src={dcosLogo} alt="Mesosphere DC/OS" className="login-logo" />
      ),
      modalClass: "modal modal-small login-modal",
      showHeader: true
    };

    return (
      <FormModal
        buttonDefinition={this.getLoginButtonDefinition()}
        definition={this.getLoginFormDefinition()}
        disabled={this.state.disableLogin}
        extraFooterContent={this.getModalFooter()}
        onSubmit={this.handleLoginSubmit}
        open={true}
        modalProps={modalProps}
      >
        <Trans render="h2" className="flush-top text-align-center">
          Log in to your account
        </Trans>
        {modalContent &&
          React.cloneElement(modalContent, { target: this.props.target })}
      </FormModal>
    );
  }
}

export default withI18n()(LoginModal);
