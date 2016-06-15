import React from 'react';

import Service from '../../../structs/Service';
import ItemVolumeTable from '../../../components/ItemVolumeTable';

class TaskVolumesTab extends React.Component {
  render() {
    return (
      <ItemVolumeTable
        service={this.props.service}
        params={this.context.router.getCurrentParams()}
        volumes={this.props.service.getVolumes().getItems()} />
    );
  }
}

TaskVolumesTab.contextTypes = {
  router: React.PropTypes.func
};

TaskVolumesTab.propTypes = {
  params: React.PropTypes.object,
  service: React.PropTypes.instanceOf(Service)
};

module.exports = TaskVolumesTab;
