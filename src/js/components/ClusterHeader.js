import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ClipboardTrigger from '../components/ClipboardTrigger';
import ClusterName from './ClusterName';
import Icon from './Icon';
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

  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.useClipboard !== this.props.useClipboard) {
      return true;
    }

    return false;
  }

  getFlashButton() {
    return <ClipboardTrigger copyText={this.getPublicIP()} />;
  }

  getPublicIP() {
    const metadata = MetadataStore.get('metadata');

    if ((typeof metadata !== 'object') ||
      metadata.PUBLIC_IPV4 == null ||
      metadata.PUBLIC_IPV4.length === 0) {
      return null;
    }

    return metadata.PUBLIC_IPV4;
  }

  getHostName() {
    let flashButton = null;
    const ip = this.getPublicIP();

    if (this.props.useClipboard) {
      flashButton = (
        <span className="header-subtitle-action">
          {this.getFlashButton()}
        </span>
      );
    }

    return (
      <div className="cluster-header-hostname header-subtitle"
        title={ip}>
        <p className="hostname text-overflow flush">
          {ip}
        </p>
        {flashButton}
      </div>
    );
  }

  render() {
    let caret = null;

    if (this.props.showCaret) {
      caret = <Icon family="tiny" id="triangle-down" key="caret" size="tiny" />;
    }

    return (
      <div className="cluster-header">
        <div className="cluster-header-name">
          <ClusterName />{caret}
        </div>
        {this.getHostName()}
      </div>
    );
  }
}

ClusterHeader.defaultProps = {
  showCaret: false,
  useClipboard: true
};

ClusterHeader.propTypes = {
  onUpdate: React.PropTypes.func,
  showCaret: React.PropTypes.bool,
  useClipboard: React.PropTypes.bool
};

module.exports = ClusterHeader;
