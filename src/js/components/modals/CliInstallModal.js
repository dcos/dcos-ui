import browserInfo from 'browser-info';
import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import React from 'react';

import ClickToSelect from '../ClickToSelect';
import Icon from '../Icon';
import MetadataStore from '../../stores/MetadataStore';

const METHODS_TO_BIND = ['onClose'];
const osTypes = [
  'Windows',
  'OS X',
  'Linux'
];

class CliInstallModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedOS: browserInfo().os
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleSelectedOSChange(selectedOS) {
    this.setState({selectedOS});
  }

  onClose() {
    this.props.onClose();
  }

  getSubHeader() {
    if (!this.props.subHeaderContent) {
      return false;
    }

    return (
      <p className="text-align-center inverse flush-bottom">
        {this.props.subHeaderContent}
      </p>
    );
  }

  getCliInstructions() {
    // TODO (DCOS-8495): Binary cli links have hardcoded version, these should
    // be updated to a /latest endpoint, when that becomes available.
    // Binary cli links are also all pointing to the open version, which is
    // intentional.
    let hostname = global.location.hostname;
    let protocol = global.location.protocol.replace(/[^\w]/g, '');
    let port = '';
    if (global.location.port) {
      port = ':' + global.location.port;
    }
    let clusterUrl = `${protocol}://${hostname}${port}`;
    let {selectedOS} = this.state;
    if (selectedOS === 'Windows') {
      return (
        <ol>
          <li>
            Download and install: <a href="https://downloads.dcos.io/binaries/cli/windows/x86-64/0.4.10/dcos.exe">
              <Icon family="mini" id="download" size="mini" /> Download dcos.exe
            </a>.
          </li>
          <li>
            <p className="short-bottom">In Terminal, enter</p>
            <div className="flush-top snippet-wrapper">
              <ClickToSelect>
                <pre className="mute prettyprint flush-bottom prettyprinted">
                  cd path/to/download/directory
                </pre>
              </ClickToSelect>
            </div>
          </li>
          <li>
            <p className="short-bottom">Enter</p>
            <div className="flush-top snippet-wrapper">
              <ClickToSelect>
                <pre className="mute prettyprint flush-bottom prettyprinted">
                  dcos config set core.dcos_url <a href={clusterUrl}>{clusterUrl}</a>
                </pre>
              </ClickToSelect>
            </div>
          </li>
          <li>
            <p className="short-bottom">Enter</p>
            <div className="flush-top snippet-wrapper">
              <ClickToSelect>
                <pre className="mute prettyprint flush-bottom prettyprinted">
                  dcos
                </pre>
              </ClickToSelect>
            </div>
          </li>
        </ol>
      );
    }

    let cliInstallScriptUrl = 'https://downloads.dcos.io/binaries/cli/darwin/x86-64/0.4.10/dcos';
    if (selectedOS === 'UNIX' || selectedOS === 'Linux' ) {
      cliInstallScriptUrl = 'https://downloads.dcos.io/binaries/cli/linux/x86-64/0.4.10/dcos';
    }

    return (
      <div>
        <p className="short-bottom">Copy and paste the code snippet into the terminal:</p>
        <div className="flush-top snippet-wrapper">
          <ClickToSelect>
            <pre className="mute prettyprint flush-bottom prettyprinted">
              {`curl ${cliInstallScriptUrl} > /usr/local/bin/dcos && \n chmod +x /usr/local/bin/dcos && \n dcos config set core.dcos_url ${clusterUrl} && \n dcos`}
            </pre>
          </ClickToSelect>
        </div>
      </div>
    );
  }

  getOSButtons() {
    let {selectedOS} = this.state;

    return osTypes.map((name, index) => {
      let classSet = classNames({
        'button button-stroke': true,
        'active': name === selectedOS
      });

      return (
        <button
          className={classSet}
          key={index}
          onClick={this.handleSelectedOSChange.bind(this, name)}>
          {name}
        </button>
      );
    });
  }

  getContent() {
    return (
      <div className="install-cli-modal-content">
        <h4 className="flush-top">Installation</h4>
        <p>Choose your operating system and follow the instructions. For any issues or questions, please refer to our <a href={MetadataStore.buildDocsURI('/usage/cli/install')} target="_blank">documentation</a>.</p>
        <div className="button-group">
          {this.getOSButtons()}
        </div>
        {this.getCliInstructions()}
      </div>
    );
  }

  render() {
    let {footer, open, showFooter, subHeaderContent, title} = this.props;
    let isWindows = (this.state.selectedOS === 'Windows');
    let titleClass = classNames({
      'modal-header-title': true,
      'text-align-center': true,
      'flush-top': !isWindows,
      'flush': isWindows,
      'flush-bottom': !subHeaderContent
    });

    return (
      <Modal
        footer={footer}
        maxHeightPercentage={0.9}
        modalClass="modal"
        onClose={this.onClose}
        open={open}
        showCloseButton={false}
        showHeader={true}
        showFooter={showFooter}
        subHeader={this.getSubHeader()}
        titleClass={titleClass}
        titleText={title}>
        {this.getContent()}
      </Modal>
    );
  }
}

CliInstallModal.propTypes = {
  title: React.PropTypes.string.isRequired,
  subHeaderContent: React.PropTypes.string,
  showFooter: React.PropTypes.bool.isRequired,
  footer: React.PropTypes.node,
  onClose: React.PropTypes.func.isRequired,
  additionalContent: React.PropTypes.element
};

module.exports = CliInstallModal;
