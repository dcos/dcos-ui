import classNames from 'classnames';
import React from 'react';

import ConfigurationMap from '../../../../../../src/js/components/ConfigurationMap';
import ConfigurationMapLabel from '../../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapRow from '../../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapValue from '../../../../../../src/js/components/ConfigurationMapValue';
import DetailViewHeader from '../../../../../../src/js/components/DetailViewHeader';
import Page from '../../../../../../src/js/components/Page';
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

    return (
      <Page>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={service.id} />} />
        <DetailViewHeader
          subTitle={this.renderSubHeader()}
          title={volume.getId()} />
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Container Path
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {volume.getContainerPath()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Mode
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {volume.getMode()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Size (MiB)
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {volume.getSize()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Application
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {service.getId()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Task ID
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {volume.getTaskID()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Host
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {volume.getHost()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </Page>
    );
  }
}

VolumeDetail.propTypes = {
  service: React.PropTypes.object.isRequired,
  volume: React.PropTypes.object.isRequired
};

module.exports = VolumeDetail;
