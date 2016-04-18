var browserInfo = require('browser-info');
var React = require('react');

var CliInstallModal = require('./modals/CliInstallModal');
import Config from '../config/Config';
var ErrorModal = require('./modals/ErrorModal');
import EventTypes from '../constants/EventTypes';
import {Hooks} from 'PluginSDK';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var SidebarStore = require('../stores/SidebarStore');
var VersionsModal = require('./modals/VersionsModal');

var Modals = React.createClass({

  displayName: 'Modals',

  mixins: [InternalStorageMixin],

  propTypes: {
    showErrorModal: React.PropTypes.bool,
    modalErrorMsg: React.PropTypes.node
  },

  getDefaultProps: function () {
    return {
      showErrorModal: false,
      modalErrorMsg: ''
    };
  },

  getInitialState: function () {
    var props = this.props;

    return {
      modalErrorMsg: props.modalErrorMsg,
      showingCliModal: false,
      showingVersionsModal: false,
      showErrorModal: props.showErrorModal
    };
  },

  componentWillReceiveProps: function (props) {
    this.setState({
      modalErrorMsg: props.modalErrorMsg,
      showErrorModal: props.showErrorModal
    });
  },

  componentDidMount: function () {
    SidebarStore.addChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS, this.handleShowCli
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_VERSIONS_SUCCESS, this.handleShowVersionsSuccess
    );

    SidebarStore.addChangeListener(
      EventTypes.SHOW_VERSIONS_ERROR, this.handleShowVersionsError
    );
  },

  componentWillUnmount: function () {
    SidebarStore.removeChangeListener(
      EventTypes.SHOW_CLI_INSTRUCTIONS, this.handleShowCli
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_VERSIONS_SUCCESS, this.handleShowVersionsSuccess
    );

    SidebarStore.removeChangeListener(
      EventTypes.SHOW_VERSIONS_ERROR, this.handleShowVersionsError
    );
  },

  handleShowVersionsSuccess: function () {
    this.setState({showingVersionsModal: true});
  },

  handleShowVersionsError: function () {
    this.setState({
      showErrorModal: true,
      modalErrorMsg: (
        <p className="text-align-center flush-bottom">
          We are unable to retreive the version {Config.productName} versions. Please try again.
        </p>
      )
    });
  },

  handleShowCli: function () {
    this.setState({showingCliModal: true});
  },

  getCliModalOptions: function () {
    var onClose = function () {
      this.setState({showingCliModal: false});
    }.bind(this);

    let OS = browserInfo().os;
    let subHeaderContent = '';

    if (OS !== 'Windows') {
      subHeaderContent = `Install the ${Config.productName} command-line interface (CLI) tool on your local system by copying and pasting the code snippet below into your terminal.`;
    }

    return {
      onClose,
      title: `Welcome to ${Config.productName}`,
      subHeaderContent,
      showFooter: true,
      footer: (
        <div>
          <div className="row text-align-center">
            <button className="button button-primary button-medium" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )
    };
  },

  getCliInstallModal: function (showModal) {
    var options = {
      onClose: function () {},
      title: '',
      subHeaderContent: '',
      showFooter: true,
      footer: <div></div>
    };

    if (this.state.showingCliModal) {
      Hooks.doAction('logFakePageView', {
        title: 'CLI instructions',
        path: '/v/cli-instructions',
        referrer: 'https://mesosphere.com/'
      });

      options = this.getCliModalOptions();
    }

    return (
      <CliInstallModal open={showModal} {...options} />
    );
  },

  getVersionsModal: function (showModal) {
    var onClose = function () {
      this.setState({showingVersionsModal: false});
    }.bind(this);

    var versions = SidebarStore.get('versions');
    return (
      <VersionsModal
        onClose={onClose}
        versionDump={versions}
        open={showModal} />
    );
  },

  getErrorModal: function (show) {
    var onClose = function () {
      this.setState({showErrorModal: false});
    }.bind(this);

    var errorMsg = null;
    if (this.state.modalErrorMsg) {
      errorMsg = this.state.modalErrorMsg;
    }

    return (
      <ErrorModal
        onClose={onClose}
        errorMsg={errorMsg}
        open={show} />
    );
  },

  render: function () {
    var showCliModal = this.state.showingCliModal;

    return (
      <div>
        {this.getCliInstallModal(showCliModal)}
        {this.getVersionsModal(this.state.showingVersionsModal)}
        {this.getErrorModal(this.state.showErrorModal)}
      </div>
    );
  }
});

module.exports = Modals;
