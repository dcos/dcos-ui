import classNames from 'classnames';
import React from 'react';

import DescriptionList from './DescriptionList';
import PageHeader from './PageHeader';
import VolumeStatus from '../constants/VolumeStatus';

class ServiceVolumeDetail extends React.Component {

  renderSubHeader(volume) {
    let status = volume.getStatus();
    let classes = classNames({
      'text-danger': status === VolumeStatus.DETACHED,
      'text-success': status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    let {params, service} = this.props;

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

ServiceVolumeDetail.propTypes = {
  params: React.PropTypes.object
};

module.exports = ServiceVolumeDetail;
