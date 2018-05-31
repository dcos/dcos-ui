import PropTypes from "prop-types";
import React from "react";

import UniversePackage from "#SRC/js/structs/UniversePackage";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
import { routerShape } from "react-router";
import FrameworkConfigurationReviewScreen from "#SRC/js/components/FrameworkConfigurationReviewScreen";
import Loader from "#SRC/js/components/Loader";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import StringUtil from "#SRC/js/utils/StringUtil";
import { COSMOS_SERVICE_DESCRIBE_CHANGE } from "#SRC/js/constants/EventTypes";
import { getDefaultFormState } from "react-jsonschema-form/lib/utils";

const METHODS_TO_BIND = [
  "handleEditClick",
  "onCosmosPackagesStoreServiceDescriptionSuccess"
];

class FrameworkConfigurationContainer extends React.Component {
  constructor(props) {
    super(props);

    const { service } = this.props;

    this.state = {
      frameworkData: null,
      packageDetails: null
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

    const schema = packageDetails.getConfig();
    const frameworkData = getDefaultFormState(
      schema,
      fullPackage.resolvedOptions,
      schema.definitions
    );

    this.setState({ frameworkData, packageDetails });
  }

  handleEditClick() {
    const { router } = this.context;
    const { service } = this.props;

    router.push(
      `/services/detail/${encodeURIComponent(service.getId())}/edit/`
    );
  }

  render() {
    const { frameworkData, packageDetails } = this.state;

    if (!frameworkData) {
      return <Loader />;
    }

    const frameworkMeta =
      StringUtil.capitalize(packageDetails.getName()) +
      " " +
      packageDetails.getVersion();

    return (
      <FrameworkConfigurationReviewScreen
        frameworkData={frameworkData}
        onEditClick={this.handleEditClick}
        frameworkMeta={frameworkMeta}
      />
    );
  }
}

FrameworkConfigurationContainer.propTypes = {
  service: PropTypes.instanceOf(Framework).isRequired
};

FrameworkConfigurationContainer.contextTypes = {
  router: routerShape
};

module.exports = FrameworkConfigurationContainer;
