import React, { PropTypes } from "react";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { routerShape } from "react-router";
import deepEqual from "deep-equal";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import FrameworkConfiguration from "#SRC/js/components/FrameworkConfiguration";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

class EditFrameworkConfiguration extends mixin(StoreMixin) {
  constructor(props) {
    super(props);

    this.state = {
      packageDetails: null,
      deployErrors: null,
      formData: null,
      formErrors: {},
      hasError: false
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: [
          "serviceDescriptionError",
          "serviceDescriptionSuccess",
          "serviceUpdateSuccess",
          "serviceUpdateError"
        ]
      }
    ];

    CosmosPackagesStore.fetchServiceDescription(props.params.id);
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const fullPackage = CosmosPackagesStore.getServiceDetails();
    const packageDetails = new UniversePackage(fullPackage.package);

    // necessary to have review screen same order of tabs as the form
    const formData = this.reorderResolvedOptions(
      fullPackage.resolvedOptions,
      packageDetails.getConfig()
    );

    this.setState({ packageDetails, formData });
  }

  onCosmosPackagesStoreServiceDescriptionError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStoreServiceUpdateSuccess() {
    this.handleGoBack();
  }

  onCosmosPackagesStoreServiceUpdateError(deployErrors) {
    this.setState({ deployErrors });
  }

  reorderResolvedOptions(resolvedOptions, config) {
    const order = Object.keys(config.properties);
    const orderedResolvedOptions = {};
    order.forEach(tab => {
      orderedResolvedOptions[tab] = resolvedOptions[tab];
    });

    return orderedResolvedOptions;
  }

  handleRun() {
    const { params } = this.props;
    const { formData } = this.state;

    CosmosPackagesStore.updateService(params.id, formData);
  }

  handleGoBack() {
    const { router } = this.context;

    router.goBack();
  }

  onFormDataChange(formData) {
    if (deepEqual(formData, this.state.formData, { strict: true })) {
      return;
    }

    this.setState({ formData });
  }

  onFormErrorChange(formErrors) {
    if (deepEqual(formErrors, this.state.formErrors)) {
      return;
    }

    this.setState({ formErrors });
  }

  render() {
    const {
      packageDetails,
      deployErrors,
      formErrors,
      formData,
      hasError
    } = this.state;

    if (packageDetails == null) {
      return <Loader className="vertical-center" />;
    }

    if (hasError) {
      return <RequestErrorMsg />;
    }

    return (
      <FrameworkConfiguration
        packageDetails={packageDetails}
        formData={formData}
        formErrors={formErrors}
        deployErrors={deployErrors}
        handleGoBack={this.handleGoBack.bind(this)}
        handleRun={this.handleRun.bind(this)}
        isInitialDeploy={false}
        onFormDataChange={this.onFormDataChange.bind(this)}
        onFormErrorChange={this.onFormErrorChange.bind(this)}
      />
    );
  }
}

EditFrameworkConfiguration.contextTypes = {
  router: routerShape
};

EditFrameworkConfiguration.propTypes = {
  params: PropTypes.object.isRequired
};

module.exports = EditFrameworkConfiguration;
