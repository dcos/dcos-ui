import Clipboard from 'clipboard';
import browserInfo from 'browser-info';
import React from 'react';
import ReactDOM from 'react-dom';
import {Tooltip} from 'reactjs-components';

import ClusterName from './ClusterName';
import MetadataStore from '../stores/MetadataStore';

var ClusterHeader = React.createClass({
  displayName: 'ClusterHeader',

  getDefaultProps: function () {
    return {
      useClipboard: true
    };
  },

  getInitialState: function () {
    return {
      hasCopiedToClipboard: false
    };
  },

  componentDidMount() {
    if (this.refs.copyButton) {
      this.clipboard = new Clipboard(ReactDOM.findDOMNode(this.refs.copyButton),
        {
          text: () => {
            return this.getPublicIP();
          }
        }
      );

      this.clipboard.on('success', this.handleCopy);
    }
  },

  componentWillUnmount() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  },

  handleCopy() {
    this.setState({hasCopiedToClipboard: true});
  },

  handleCopyIconMouseEnter() {
    this.setState({hasCopiedToClipboard: false});
  },

  getFlashButton() {
    let clipboardIcon = null;
    let tooltipContent = 'Copy to clipboard';

    if (this.props.useClipboard) {
      clipboardIcon = (
        <i className="icon icon-sprite icon-sprite-mini icon-clipboard
          icon-sprite-mini-color clickable"
          onMouseEnter={this.handleCopyIconMouseEnter} />
      );
    }

    if (this.state.hasCopiedToClipboard) {
      tooltipContent = 'Copied!';
    }

    if (!/safari/i.test(browserInfo().name)) {
      return (
        <Tooltip position="bottom" content={tooltipContent} ref="copyButton">
          {clipboardIcon}
        </Tooltip>
      );
    }

    return null;
  },

  getPublicIP() {
    let metadata = MetadataStore.get('metadata');

    if ((typeof metadata !== 'object') ||
      metadata.PUBLIC_IPV4 == null ||
      metadata.PUBLIC_IPV4.length === 0) {
      return null;
    }

    return metadata.PUBLIC_IPV4;
  },

  getHostName() {
    let ip = this.getPublicIP();

    return (
      <div className="sidebar-header-sublabel"
        title={ip}>
        <span className="hostname text-overflow">
          {ip}
        </span>
        <span className="sidebar-header-sublabel-action">
          {this.getFlashButton()}
        </span>
      </div>
    );
  },

  render() {
    return (
      <div className="container container-fluid container-fluid-narrow container-pod container-pod-short">
        <ClusterName />
        {this.getHostName()}
      </div>
    );
  }
});

module.exports = ClusterHeader;
