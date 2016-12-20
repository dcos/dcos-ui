import classNames from 'classnames';
import React from 'react';

import Page from '../../../../../../src/js/components/Page';
import DescriptionList from '../../../../../../src/js/components/DescriptionList';
import DetailViewHeader from '../../../../../../src/js/components/DetailViewHeader';
import ServiceBreadcrumbs from '../../components/ServiceBreadcrumbs';
import VolumeStatus from '../../constants/VolumeStatus';

class VolumeDetail extends React.Component {
  renderSubHeader() {
    const {volume} = this.props;

    const status = volume.getStatus();
    const classes = classNames({
      'text-danger': status === VolumeStatus.DETACHED,
      'text-success': status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    const {service, volume} = this.props;

    const detailsHash = {
      'Container Path': volume.getContainerPath(),
      'Mode': volume.getMode(),
      'Size (MiB)': volume.getSize(),
      'Application': service.getId(),
      'Task ID': volume.getTaskID(),
      'Host': volume.getHost()
    };

    return (
      <Page>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={service.id} />} />
        <DetailViewHeader
          subTitle={this.renderSubHeader()}
          title={volume.getId()} />
        <DescriptionList hash={detailsHash} />
      </Page>
    );
  }
}

VolumeDetail.propTypes = {
  service: React.PropTypes.object.isRequired,
  volume: React.PropTypes.object.isRequired
};

module.exports = VolumeDetail;
