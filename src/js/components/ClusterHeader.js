import React from 'react';

import ClipboardTrigger from '../components/ClipboardTrigger';
import ClusterName from './ClusterName';
import MetadataStore from '../stores/MetadataStore';

var ClusterHeader = React.createClass({
  displayName: 'ClusterHeader',

  getDefaultProps: function () {
    return {
      useClipboard: true
    };
  },

  getFlashButton() {
    if (!this.props.useClipboard) {
      return null;
    }

    return <ClipboardTrigger copyText={this.getPublicIP()} />;
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
