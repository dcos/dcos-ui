import { i18nMark } from "@lingui/react";
import PropTypes from "prop-types";
import React from "react";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { routerShape } from "react-router";
import isEqual from "lodash.isequal";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import Page from "#SRC/js/components/Page";
import UniversePackage from "#SRC/js/structs/UniversePackage";
import FrameworkConfiguration from "#SRC/js/components/FrameworkConfiguration";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import { getDefaultFormState } from "react-jsonschema-form/lib/utils";

class EditFrameworkConfiguration extends mixin(StoreMixin) {
  constructor(props) {
    super(props);

    this.state = {
      packageDetails: null,
      deployErrors: null,
      formData: null,
      formErrors: {},
      cosmosErrors: null,
      defaultConfigWarning: null
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

    const schema = packageDetails.getConfig();
    const formData = getDefaultFormState(
      schema,
      fullPackage.resolvedOptions,
      schema.definitions
    );

    const defaultConfigWarning = fullPackage.resolvedOptions
      ? null
      : i18nMark(
          "This service was initially deployed to a previous version of DC/OS that did not store service configuration settings. The default package values were used to populate the configuration in this form. Carefully verify the default settings are correct, prior to deploying the new configuration."
        );

    this.setState({
      cosmosErrors: null,
      packageDetails,
      formData,
      defaultConfigWarning
    });
  }

  onCosmosPackagesStoreServiceDescriptionError(cosmosErrors) {
    this.setState({ cosmosErrors });
  }

  onCosmosPackagesStoreServiceUpdateSuccess() {
    this.handleGoBack();
  }

  onCosmosPackagesStoreServiceUpdateError(deployErrors) {
    this.setState({ deployErrors });
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
    if (isEqual(formData, this.state.formData, { strict: true })) {
      return;
    }

    this.setState({ formData });
  }

  onFormErrorChange(formErrors) {
    if (isEqual(formErrors, this.state.formErrors)) {
      return;
    }

    this.setState({ formErrors });
  }

  render() {
    const {
      packageDetails,
      deployErrors,
      formData,
      formErrors,
      cosmosErrors,
      defaultConfigWarning
    } = this.state;

    if (cosmosErrors) {
      return (
        <Page>
          <RequestErrorMsg
            message={
              <p className="text-align-center flush-bottom">{cosmosErrors}</p>
            }
          />
        </Page>
      );
    }

    if (packageDetails == null) {
      return <Loader className="vertical-center" />;
    }

    return (
      <FrameworkConfiguration
        handleGoBack={this.handleGoBack.bind(this)}
        handleRun={this.handleRun.bind(this)}
        onFormDataChange={this.onFormDataChange.bind(this)}
        onFormErrorChange={this.onFormErrorChange.bind(this)}
        packageDetails={packageDetails}
        deployErrors={deployErrors}
        formData={formData}
        formErrors={formErrors}
        defaultConfigWarning={defaultConfigWarning}
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

export default EditFrameworkConfiguration;
