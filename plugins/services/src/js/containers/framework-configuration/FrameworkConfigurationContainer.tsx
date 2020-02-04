import PropTypes from "prop-types";
import * as React from "react";

import UniversePackage from "#SRC/js/structs/UniversePackage";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
import Application from "#PLUGINS/services/src/js/structs/Application";

import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import { routerShape } from "react-router";
import FrameworkConfigurationReviewScreen from "#SRC/js/components/FrameworkConfigurationReviewScreen";
import Loader from "#SRC/js/components/Loader";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import StringUtil from "#SRC/js/utils/StringUtil";
import {
  COSMOS_SERVICE_DESCRIBE_CHANGE,
  COSMOS_SERVICE_DESCRIBE_ERROR
} from "#SRC/js/constants/EventTypes";
import { getDefaultFormState } from "react-jsonschema-form/lib/utils";

export default class FrameworkConfigurationContainer extends React.Component {
  static contextTypes = {
    router: routerShape
  };
  static propTypes = {
    service: PropTypes.oneOfType([
      PropTypes.instanceOf(Framework),
      PropTypes.instanceOf(Application)
    ]).isRequired
  };
  constructor(props) {
    super(props);

    const { service } = this.props;

    this.state = {
      frameworkData: null,
      packageDetails: null,
      cosmosError: null
    };

    CosmosPackagesStore.fetchServiceDescription(service.getId());
  }

  componentDidMount() {
    CosmosPackagesStore.addChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
    CosmosPackagesStore.addChangeListener(
      COSMOS_SERVICE_DESCRIBE_ERROR,
      this.onCosmosPackagesStoreServiceDescriptionError
    );
  }

  componentWillUnmount() {
    CosmosPackagesStore.removeChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
    CosmosPackagesStore.removeChangeListener(
      COSMOS_SERVICE_DESCRIBE_ERROR,
      this.onCosmosPackagesStoreServiceDescriptionError
    );
  }
  onCosmosPackagesStoreServiceDescriptionSuccess = () => {
    const fullPackage = CosmosPackagesStore.getServiceDetails();
    const packageDetails = new UniversePackage(fullPackage.package);

    const schema = packageDetails.getConfig();
    const frameworkData = getDefaultFormState(
      schema,
      fullPackage.resolvedOptions,
      schema.definitions
    );

    this.setState({ frameworkData, packageDetails, cosmosError: null });
  };
  onCosmosPackagesStoreServiceDescriptionError = cosmosError => {
    this.setState({ cosmosError });
  };
  handleEditClick = () => {
    const { router } = this.context;
    const { service } = this.props;

    router.push(
      `/services/detail/${encodeURIComponent(service.getId())}/edit/`
    );
  };

  render() {
    const { frameworkData, packageDetails, cosmosError } = this.state;

    if (cosmosError) {
      const message = (
        <p className="text-align-center flush-bottom">{cosmosError}</p>
      );

      return <RequestErrorMsg message={message} />;
    }

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
