import PropTypes from "prop-types";
import * as React from "react";
import { Trans } from "@lingui/macro";

import { DCOS_CHANGE } from "#SRC/js/constants/EventTypes";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import Loader from "#SRC/js/components/Loader";

import ServiceItemNotFound from "../../components/ServiceItemNotFound";
import PodVolumeDetail from "./PodVolumeDetail";

export default class PodVolumeContainer extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired
  };
  constructor(...args) {
    super(...args);

    this.state = {
      isLoading: !DCOSStore.serviceDataReceived,
      lastUpdate: 0
    };
  }

  componentDidMount() {
    DCOSStore.addChangeListener(DCOS_CHANGE, this.onStoreChange);
  }

  componentWillUnmount() {
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.onStoreChange);
  }
  onStoreChange = () => {
    // Throttle updates from DCOSStore
    if (
      Date.now() - this.state.lastUpdate > 1000 ||
      (DCOSStore.serviceDataReceived && this.state.isLoading)
    ) {
      this.setState({
        isLoading: !DCOSStore.serviceDataReceived,
        lastUpdate: Date.now()
      });
    }
  };

  render() {
    const { id, volumeID } = this.props.params;
    const serviceId = decodeURIComponent(id);
    const service = DCOSStore.serviceTree.findItemById(serviceId);
    const volumeId = decodeURIComponent(volumeID);

    if (this.state.isLoading) {
      return <Loader />;
    }

    if (!service) {
      return (
        <ServiceItemNotFound
          message={
            <Trans render="span">
              The service with the ID of "{id}" could not be found.
            </Trans>
          }
        />
      );
    }

    const volume = service
      .getVolumesData()
      .find(volume => volume.id === volumeId);

    if (!volume) {
      return (
        <ServiceItemNotFound
          message={
            <Trans render="span">Volume '{volumeId}' was not found.</Trans>
          }
        />
      );
    }

    return <PodVolumeDetail service={service} volume={volume} />;
  }
}
