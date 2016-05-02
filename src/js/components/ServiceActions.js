import React from 'react';

import Service from '../structs/Service';

class ServiceInfo extends React.Component {
  render() {
    let {service} = this.props;
    let openServiceButton;

    if (service.getWebURL()) {
      openServiceButton = (
        <a className="button button-primary" href={service.getWebURL()}
          target="_blank">
          Open Service
        </a>
      );
    }

    return (
      <div className="button-collection">
        {openServiceButton}
        <a onClick={this.handleServiceEditClick}
          className="button button-inverse button-stroke">
          Edit
        </a>
      </div>
    );
  }
}

ServiceInfo.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceInfo;
