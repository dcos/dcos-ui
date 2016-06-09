import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ClipboardTrigger from '../components/ClipboardTrigger';
import ClusterName from './ClusterName';
import MetadataStore from '../stores/MetadataStore';

class ClusterHeader extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'metadata',
        events: ['success'],
        listenAlways: false
      }
    ];
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.useClipboard !== this.props.useClipboard) {
      return true;
    }

    return false;
  }

  getFlashButton() {
    if (!this.props.useClipboard) {
      return null;
    }

    return <ClipboardTrigger copyText={this.getPublicIP()} />;
  }

  getPublicIP() {
    let metadata = MetadataStore.get('metadata');

    if ((typeof metadata !== 'object') ||
      metadata.PUBLIC_IPV4 == null ||
      metadata.PUBLIC_IPV4.length === 0) {
      return null;
    }

    return metadata.PUBLIC_IPV4;
  }

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
  }

  render() {
    return (
      <div className="container container-fluid container-fluid-narrow container-pod container-pod-short">
        <ClusterName />
        {this.getHostName()}
      </div>
    );
  }
}

ClusterHeader.defaultProps = {
  useClipboard: true
};

ClusterHeader.propTypes = {
  useClipboard: React.PropTypes.bool
};

module.exports = ClusterHeader;
