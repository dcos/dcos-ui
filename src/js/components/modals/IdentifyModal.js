var classNames = require('classnames');
import {Modal} from 'reactjs-components';
var React = require('react');

import Config from '../../config/Config';
var InternalStorageMixin = require('../../mixins/InternalStorageMixin');
var Validator = require('../../utils/Validator');

var IdentifyModal = React.createClass({

  displayName: 'IdentifyModal',

  propTypes: {
    onLogin: React.PropTypes.func.isRequired
  },

  mixins: [InternalStorageMixin],

  componentWillMount: function () {
    this.internalStorage_set({
      emailHasError: false,
      email: ''
    });
  },

  handleSubmit: function (e) {
    e.preventDefault();

    var email = this.refs.email.value.toLowerCase();

    if (!Validator.isEmail(email)) {
      this.internalStorage_update({
        emailHasError: true,
        email: email
      });

      this.forceUpdate();

      return;
    }

    this.props.onLogin(email);
  },

  getFooter: function () {
    return (
      <div className="button-collection button-collection-align-horizontal-center flush-bottom">
        <button className="button button-primary button-large button-wide-below-screen-mini"
            onClick={this.handleSubmit}>
          Try {Config.productName}
        </button>
      </div>
    );
  },

  getSubHeader: function () {
    return (
      <p className="text-align-center inverse">
        Your feedback means a lot to us. Please provide an email address below
        that we can use to respond to your comments and suggestions.
      </p>
    );
  },

  render: function () {
    var data = this.internalStorage_get();
    var emailClassSet = classNames({
      'form-group': true,
      'flush-bottom': true,
      'form-group-error': data.emailHasError
    });

    var emailHelpBlock = classNames({
      'form-help-block': true,
      'hidden': !data.emailHasError
    });

    return (
      <Modal
        closeByBackdropClick={false}
        footer={this.getFooter()}
        maxHeightPercentage={0.9}
        modalClass="modal"
        modalClassName="login-modal"
        open={this.props.open}
        showCloseButton={false}
        showHeader={true}
        showFooter={true}
        subHeader={this.getSubHeader()}
        titleClass="modal-header-title text-align-center flush-top"
        titleText={Config.productName}>
        <form className="flush-bottom"
          onSubmit={this.handleSubmit}>
          <div className={emailClassSet}>
            <input className="form-control flush-bottom"
              autoFocus={true}
              type="email"
              placeholder="Email address"
              ref="email" />
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
