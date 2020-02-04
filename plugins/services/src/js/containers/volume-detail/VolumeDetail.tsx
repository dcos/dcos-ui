import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
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
import VolumeStatus, { statusFromVolume } from "../../constants/VolumeStatus";

export default class VolumeDetail extends React.Component {
  static propTypes = {
    service: PropTypes.object.isRequired,
    volume: PropTypes.object.isRequired
  };
  getSizeLabel() {
    if (this.props.volume.type === "External") {
      return <Trans render="span">Size (GiB)</Trans>;
    }

    return <Trans render="span">Size (MiB)</Trans>;
  }

  renderSubHeader() {
    const { volume } = this.props;

    const status = statusFromVolume(volume);
    const classes = classNames({
      "text-danger": status === VolumeStatus.DETACHED,
      "text-success": status === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{status}</span>;
  }

  render() {
    const { service, volume } = this.props;

    const serviceID = service.id;
    const encodedServiceId = encodeURIComponent(serviceID);
    const volumeId = volume.id;

    const extraCrumbs = [
      <Breadcrumb key={-1} title="Services">
        <BreadcrumbTextContent>
          <Link
            to={`/services/detail/${encodedServiceId}/volumes/${volumeId}`}
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
              <Trans render={<ConfigurationMapLabel />}>Container Path</Trans>
              <ConfigurationMapValue>
                {volume.containerPath}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Mode</Trans>
              <ConfigurationMapValue>{volume.mode}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                {this.getSizeLabel()}
              </ConfigurationMapLabel>
              <ConfigurationMapValue>{volume.size}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Application</Trans>
              <ConfigurationMapValue>{serviceID}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Task ID</Trans>
              <ConfigurationMapValue>{volume.taskID}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <Trans render={<ConfigurationMapLabel />}>Host</Trans>
              <ConfigurationMapValue>{volume.host}</ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </Page>
    );
  }
}
