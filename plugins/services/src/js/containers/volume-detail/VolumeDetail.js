import classNames from "classnames";
import React from "react";
import { Link } from "react-router";

import Breadcrumb from "../../../../../../src/js/components/Breadcrumb";
import BreadcrumbTextContent
  from "../../../../../../src/js/components/BreadcrumbTextContent";
import ConfigurationMap
  from "../../../../../../src/js/components/ConfigurationMap";
import ConfigurationMapLabel
  from "../../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../../src/js/components/ConfigurationMapValue";
import DetailViewHeader
  from "../../../../../../src/js/components/DetailViewHeader";
import Page from "../../../../../../src/js/components/Page";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import VolumeStatus from "../../constants/VolumeStatus";

class VolumeDetail extends React.Component {
  getSizeLabel() {
    if (this.props.volume.type === "External") {
      return "Size (GiB)";
    }

    return "Size (MiB)";
  }

  renderSubHeader() {
    const { volume } = this.props;

    const status = volume.getStatus();
    const classes = classNames({
      "text-danger": status === VolumeStatus.DETACHED,
      "text-success": status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    const { service, volume } = this.props;

    const serviceID = service.getId();
    const encodedServiceId = encodeURIComponent(serviceID);
    const volumeId = volume.getId();

    const extraCrumbs = [
      <Breadcrumb key={-1} title="Services">
        <BreadcrumbTextContent>
          <Link
            to={`/services/overview/${encodedServiceId}/volumes/${volumeId}`}
            key="volume"
          >

            {volumeId}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];

    const breadcrumbs = (
      <ServiceBreadcrumbs serviceID={serviceID} extra={extraCrumbs} />
    );

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <DetailViewHeader subTitle={this.renderSubHeader()} title={volumeId} />
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
                {this.getSizeLabel()}
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
                {serviceID}
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
