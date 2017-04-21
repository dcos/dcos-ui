import classNames from "classnames";
import { Modal } from "reactjs-components";
import React from "react";

import Config from "../../config/Config";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import ModalHeading from "../modals/ModalHeading";
import ValidatorUtil from "../../utils/ValidatorUtil";

var IdentifyModal = React.createClass({
  displayName: "IdentifyModal",

  propTypes: {
    onLogin: React.PropTypes.func.isRequired
  },

  mixins: [InternalStorageMixin],

  componentWillMount() {
    this.internalStorage_set({
      emailHasError: false,
      email: ""
    });
  },

  handleSubmit(e) {
    e.preventDefault();

    var email = this.refs.email.value.toLowerCase();

    if (!ValidatorUtil.isEmail(email)) {
      this.internalStorage_update({
        emailHasError: true,
        email
      });

      this.forceUpdate();

      return;
    }

    this.props.onLogin(email);
  },

  getFooter() {
    return (
      <div className="button-collection button-collection-align-horizontal-center flush-bottom">
        <button
          className="button button-primary button-wide-below-screen-mini"
          onClick={this.handleSubmit}
        >
          Try {Config.productName}
        </button>
      </div>
    );
  },

  getHeader() {
    return (
      <ModalHeading level={5}>
        {Config.productName}
      </ModalHeading>
    );
  },

  getSubHeader() {
    return (
      <p className="text-align-center">
        Your feedback means a lot to us. Please provide an email address below
        that we can use to respond to your comments and suggestions.
      </p>
    );
  },

  render() {
    var data = this.internalStorage_get();
    var emailClassSet = classNames({
      "form-group": true,
      "flush-bottom": true,
      "form-group-danger": data.emailHasError
    });

    var emailHelpBlock = classNames({
      "form-control-feedback": true,
      hidden: !data.emailHasError
    });

    return (
      <Modal
        closeByBackdropClick={false}
        footer={this.getFooter()}
        header={this.getHeader()}
        modalClass="modal"
        modalClassName="login-modal"
        open={this.props.open}
        showHeader={true}
        showFooter={true}
        subHeader={this.getSubHeader()}
      >
        <form className="flush-bottom" onSubmit={this.handleSubmit}>
          <div className={emailClassSet}>
            <input
              className="form-control flush-bottom"
              autoFocus={true}
              type="email"
              placeholder="Email address"
              ref="email"
            />
            <p className={emailHelpBlock}>
              Please provide a valid email address (e.g. email@domain.com).
            </p>
          </div>
        </form>
      </Modal>
    );
  }
});

module.exports = IdentifyModal;
