import React from 'react';

import Service from '../../structs/Service';
import ItemVolumeTable from '../../components/ItemVolumeTable';

class ServicesVolumesTab extends React.Component {
  render() {
    return (
      <ItemVolumeTable
        service={this.props.service}
        params={this.context.router.getCurrentParams()}
        volumes={this.props.service.getVolumes().getItems()} />
    );
  }
}

ServicesVolumesTab.contextTypes = {
  router: React.PropTypes.func
};

ServicesVolumesTab.propTypes = {
  params: React.PropTypes.object,
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServicesVolumesTab;
