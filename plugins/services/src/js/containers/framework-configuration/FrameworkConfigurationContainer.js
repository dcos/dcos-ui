import React from "react";

import UniversePackage from "#SRC/js/structs/UniversePackage";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
import { routerShape } from "react-router";
import FrameworkConfigurationReviewScreen
  from "#SRC/js/components/FrameworkConfigurationReviewScreen";
import Loader from "src/js/components/Loader";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import { COSMOS_SERVICE_DESCRIBE_CHANGE } from "#SRC/js/constants/EventTypes";

const METHODS_TO_BIND = [
  "reorderResolvedOptions",
  "handleEditClick",
  "onCosmosPackagesStoreServiceDescriptionSuccess"
];

class FrameworkConfigurationContainer extends React.Component {
  constructor(props) {
    super(props);

    const { service } = this.props;

    this.state = {
      frameworkData: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    CosmosPackagesStore.fetchServiceDescription(service.getId());
  }

  componentDidMount() {
    CosmosPackagesStore.addChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
  }

  componentWillUnmount() {
    CosmosPackagesStore.removeChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const fullPackage = CosmosPackagesStore.getServiceDetails();
    const packageDetails = new UniversePackage(fullPackage.package);

    // necessary to have review screen same order of tabs as the form
    const frameworkData = this.reorderResolvedOptions(
      fullPackage.resolvedOptions,
      packageDetails.getConfig()
    );

    this.setState({ frameworkData });
  }

  reorderResolvedOptions(resolvedOptions, config) {
    const order = Object.keys(config.properties);
    const orderedResolvedOptions = {};
    order.forEach(tab => {
      orderedResolvedOptions[tab] = resolvedOptions[tab];
    });

    return orderedResolvedOptions;
  }

  handleEditClick() {
    const { router } = this.context;
    const { service } = this.props;

    router.push(
      `/services/detail/${encodeURIComponent(service.getId())}/edit/`
    );
  }

  render() {
    const { frameworkData } = this.state;

    if (!frameworkData) {
      return <Loader />;
    }

    return (
      <FrameworkConfigurationReviewScreen
        frameworkData={frameworkData}
        onEditClick={this.handleEditClick}
      />
    );
  }
}

FrameworkConfigurationContainer.propTypes = {
  service: React.PropTypes.instanceOf(Framework).isRequired
};

FrameworkConfigurationContainer.contextTypes = {
  router: routerShape
};

module.exports = FrameworkConfigurationContainer;
