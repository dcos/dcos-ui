import classNames from 'classnames';
import React from 'react';

import Breadcrumbs from '../components/Breadcrumbs';
import DescriptionList from './DescriptionList';
import DCOSStore from '../stores/DCOSStore';
import MarathonStore from '../stores/MarathonStore';
import PageHeader from './PageHeader';
import VolumeStatus from '../constants/VolumeStatus';

class ItemVolumeDetail extends React.Component {
  renderSubHeader(volume) {
    let status = volume.getStatus();
    let classes = classNames({
      'text-danger': status === VolumeStatus.DETACHED,
      'text-success': status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    let {params} = this.props;
    let routes = this.context.router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 1];

    let service = null;
    if (currentRoute.name === 'service-details-volumes') {
      let id = decodeURIComponent(params.id);
      service = DCOSStore.serviceTree.findItemById(id);
    } else {
      // This `if` will be executed if you look at volumes in a taskID for
      // both a service or a single node
      service = MarathonStore.getServiceFromTaskID(params.taskID);
    }

    let volume = service.getVolumes().findItem((volume) => {
      return volume.getId() === global.decodeURIComponent(params.volumeID);
    });

    let detailsHash = {
      'Container Path': volume.getContainerPath(),
      'Mode': volume.getMode(),
      'Size (MiB)': volume.getSize(),
      'Application': service.getId(),
      // TODO: Figure out how to get the correct task ID.
      // 'Task ID': volume.getId(),
      'Host': volume.getHost()
    };

    return (
      <div>
        <Breadcrumbs />
        <PageHeader
          dividerClassName={{
            'container-pod-divider-bottom': false,
            'flush-bottom': true
          }}
          subTitle={this.renderSubHeader(volume)}
          title={volume.getId()} />
        <DescriptionList hash={detailsHash} />
      </div>
    );
  }
}

ItemVolumeDetail.propTypes = {
  params: React.PropTypes.object
};

ItemVolumeDetail.contextTypes = {
  router: React.PropTypes.func
};

module.exports = ItemVolumeDetail;
