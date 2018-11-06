import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";
import { Trans } from "@lingui/macro";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DetailViewHeader from "#SRC/js/components/DetailViewHeader";
import Page from "#SRC/js/components/Page";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import VolumeStatus from "../../constants/VolumeStatus";

class PodVolumeDetail extends React.Component {
  getSizeLabel() {
    if (this.props.volume.type === "External") {
      return <Trans render="span">Size (GiB)</Trans>;
    }

    return <Trans render="span">Size (MiB)</Trans>;
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
            to={`/services/detail/${encodedServiceId}/podvolumes/${escape(
              volumeId
            )}`}
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
            {volume.getMounts().map(({ containerName, mountPath }) => (
              <ConfigurationMapRow>
                <Trans render={<ConfigurationMapLabel />}>
                  {containerName} Path
                </Trans>
                <ConfigurationMapValue>{mountPath}</ConfigurationMapValue>
              </ConfigurationMapRow>
            ))}
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                {this.getSizeLabel()}
              </ConfigurationMapLabel>
              <ConfigurationMapValue>{volume.getSize()}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Application</Trans>
              <ConfigurationMapValue>{serviceID}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Profile Name</Trans>
              <ConfigurationMapValue>
                {volume.getProfile()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Task ID</Trans>
              <ConfigurationMapValue>
                {volume.getTaskID()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Host</Trans>
              <ConfigurationMapValue>{volume.getHost()}</ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </Page>
    );
  }
}

PodVolumeDetail.propTypes = {
  service: PropTypes.object.isRequired,
  volume: PropTypes.object.isRequired
};

module.exports = PodVolumeDetail;
