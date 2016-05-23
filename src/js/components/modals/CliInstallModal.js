var browserInfo = require('browser-info');
var classNames = require('classnames');
import {Hooks} from 'PluginSDK';
import {Modal} from 'reactjs-components';
var React = require('react');

import ClickToSelect from '../ClickToSelect';
import Config from '../../config/Config';
import MetadataStore from '../../stores/MetadataStore';

var CliInstructionsModal = React.createClass({

  displayName: 'CliInstructionsModal',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    subHeaderContent: React.PropTypes.string,
    showFooter: React.PropTypes.bool.isRequired,
    footer: React.PropTypes.node,
    onClose: React.PropTypes.func.isRequired,
    additionalContent: React.PropTypes.element
  },

  onClose: function () {
    this.props.onClose();
  },

  getSubHeader: function () {
    if (!this.props.subHeaderContent) {
      return false;
    }

    return (
      <p className="text-align-center inverse flush-bottom">
        {this.props.subHeaderContent}
      </p>
    );
  },

  getCliInstructions: function () {
    var hostname = window.location.hostname;
    var OS = browserInfo().os;
    var requirements = '';
    var cliSnippet = '';

    if (OS === 'Windows') {
      let appendText = Hooks.applyFilter(
        'installCLIModalAppendInstructions', ''
      );
      requirements = (
        <p>
          Install the {Config.productName} command-line interface (CLI) tool on your local system by following <a href={MetadataStore.buildDocsURI('/usage/cli/install/#windows')} target="_blank">these instructions</a>. You must install the CLI to administer your DCOS cluster. {appendText}
        </p>
      );
    } else {
      requirements = (
        <div>
          <h4 className="flush-top">Prerequisites:</h4>
          <ul>
            <li>A command-line environment, such as Terminal.</li>
            <li>
              Python 2.7.9 or 3.4.x. (Python 3.5.x will not work.)
            </li>
            <li>
            <a href="http://curl.haxx.se/download.html" target="_blank">cURL</a>, <a href="https://pip.pypa.io/en/latest/installing.html#install-pip" target="_blank">pip</a>, and <a href="https://virtualenv.pypa.io/en/latest/installation.html" target="_blank">virtualenv</a>.
            </li>
          </ul>
        </div>
      );
      let cliInstallScriptUrl = Hooks.applyFilter(
        'installCLIModalCLIInstallURL',
        `${Config.downloadsURI}/dcos-cli/install-optout.sh`
      );
      let cliInstallOutputScript = Hooks.applyFilter(
        'installCLIModalCLIInstallScript', './install-optout.sh'
      );
      let protocol = global.location.protocol.replace(/[^\w]/g, '');
      cliSnippet = `mkdir -p dcos && cd dcos && \n  curl -O ${cliInstallScriptUrl} && \n  bash ${cliInstallOutputScript} . ${protocol}://${hostname} && \n  source ./bin/env-setup`;
    }

    if (cliSnippet) {
      cliSnippet = (
        <div>
          <h4 className="snippet-description">To install the CLI, copy and paste into your terminal:</h4>
          <div className="flush-top snippet-wrapper">
            <ClickToSelect>
              <pre className="mute prettyprint flush-bottom prettyprinted">{cliSnippet}</pre>
            </ClickToSelect>
          </div>
        </div>
      );
    }

    return {requirements, cliSnippet};
  },

  getContent: function () {
    var instructions = this.getCliInstructions();
    return (
      <div className="install-cli-modal-content">
        {instructions.requirements}
        {instructions.cliSnippet}
      </div>
    );
  },

  render: function () {
    let isWindows = (browserInfo().os === 'Windows');
    let titleClass = classNames({
      'modal-header-title': true,
      'text-align-center': true,
      'flush-top': !isWindows,
      'flush': isWindows
    });

    return (
      <Modal
        footer={this.props.footer}
        maxHeightPercentage={0.9}
        modalClass="modal"
        onClose={this.onClose}
        open={this.props.open}
        showCloseButton={false}
        showHeader={true}
        showFooter={this.props.showFooter}
        subHeader={this.getSubHeader()}
        titleClass={titleClass}
        titleText={this.props.title}>
        {this.getContent()}
      </Modal>
    );
  }
});

module.exports = CliInstructionsModal;
