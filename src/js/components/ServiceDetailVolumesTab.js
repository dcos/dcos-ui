import React from 'react';

import Service from '../structs/Service';

class ServiceDetailVolumesTab extends React.Component {

  render() {
    // TODO: Introduce volumes view and properly render volumes
    let {service} = this.props;
    let volumes = service.getVolumes().getItems();

    return (
      <pre>{JSON.stringify(volumes, null, 2)}</pre>
    );
  }

}

ServiceDetailVolumesTab.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceDetailVolumesTab;
