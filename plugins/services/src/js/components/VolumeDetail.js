import classNames from 'classnames';
import {DCOSStore} from 'foundation-ui';
import React from 'react';

import Breadcrumbs from '../../../../../src/js/components/Breadcrumbs';
import DescriptionList from '../../../../../src/js/components/DescriptionList';
import DetailViewHeader from '../../../../../src/js/components/DetailViewHeader';
import VolumeStatus from '../constants/VolumeStatus';

class VolumeDetail extends React.Component {
  renderSubHeader(volume) {
    if (!volume) {
      return null;
    }

    let status = volume.getStatus();
    let classes = classNames({
      'text-danger': status === VolumeStatus.DETACHED,
      'text-success': status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    let {params} = this.props;
    let routes = this.props.routes;
    let currentRoute = routes[routes.length - 1];
    let {serviceTree} = DCOSStore;

    let pageContent = null;
    let service = null;
    let volume = null;

    if (currentRoute.path === '/services/overview/:id/volumes/:volumeID') {
      let id = decodeURIComponent(params.id);
      service = serviceTree.findItemById(id);
    } else {
      // This `if` will be executed if you look at volumes in a taskID for
      // both a service or a single node
      service = serviceTree.getServiceFromTaskID(params.taskID);
    }

    if (service) {
      volume = service.getVolumes().findItem((volume) => {
        return volume.getId() === global.decodeURIComponent(params.volumeID);
      });

      let detailsHash = {
        'Container Path': volume.getContainerPath(),
        'Mode': volume.getMode(),
        'Size (MiB)': volume.getSize(),
        'Application': service.getId(),
        'Task ID': volume.getTaskID(),
        'Host': volume.getHost()
      };

      pageContent = <DescriptionList hash={detailsHash} />;
    }

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <DetailViewHeader
          subTitle={this.renderSubHeader(volume)}
          title={volume.getId()} />
        {pageContent}
      </div>
    );
  }
}

VolumeDetail.propTypes = {
  params: React.PropTypes.object
};

VolumeDetail.contextTypes = {
  router: React.PropTypes.object
};

module.exports = VolumeDetail;
