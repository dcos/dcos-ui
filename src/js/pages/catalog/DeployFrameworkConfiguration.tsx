import * as React from "react";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import qs from "query-string";
import isEqual from "lodash.isequal";
import { routerShape } from "react-router";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import FrameworkConfiguration from "#SRC/js/components/FrameworkConfiguration";
import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import Page from "#SRC/js/components/Page";
import { getDefaultFormState } from "react-jsonschema-form/lib/utils";

import StoreMixin from "#SRC/js/mixins/StoreMixin";

class DeployFrameworkConfiguration extends mixin(StoreMixin) {
  static propTypes = {
    params: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);

    this.state = {
      packageDetails: null,
      deployErrors: null,
      formErrors: {},
      formData: null,
      hasError: false,
      isPending: false
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "cosmosPackages", events: ["packageDescriptionSuccess", "packageDescriptionError", "installSuccess", "installError"]}
    ];

    CosmosPackagesStore.fetchPackageDescription(
      props.params.packageName,
      props.location.query.version
    );
  }

  onCosmosPackagesStorePackageDescriptionSuccess() {
    const packageDetails = CosmosPackagesStore.getPackageDetails();
    const schema = packageDetails.getConfig();
    const formData = getDefaultFormState(schema, undefined, schema.definitions);
    this.setState({ packageDetails, formData });
  }

  onCosmosPackagesStorePackageDescriptionError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStoreInstallSuccess(name, version, appId) {
    const { router } = this.context;
    const { params, location } = this.props;

    const query = {
      ...location.query,
      appId
    };

    router.push(
      `/catalog/packages/${encodeURIComponent(
        params.packageName
      )}?${qs.stringify(query)}`
    );

    this.setState({ isPending: false });
  }
  onCosmosPackagesStoreInstallError = deployErrors => {
    this.setState({
      deployErrors,
      isPending: false
    });
  };
  handleRun = () => {
    const { packageDetails, formData } = this.state;

    const name = packageDetails.getName();
    const version = packageDetails.getVersion();
    CosmosPackagesStore.installPackage(name, version, formData);

    this.setState({ isPending: true });
  };
  handleGoBack = () => {
    const { router } = this.context;
    router.goBack();
  };
  onFormDataChange = formData => {
    if (isEqual(formData, this.state.formData)) {
      return false;
    }

    this.setState({ formData });
  };
  onFormErrorChange = formErrors => {
    if (isEqual(formErrors, this.state.formErrors)) {
      return false;
    }

    this.setState({ formErrors });
  };

  render() {
    const {
      packageDetails,
      deployErrors,
      formData,
      formErrors,
      hasError
    } = this.state;

    if (packageDetails == null) {
      return (
        <Page>
          <Loader className="vertical-center" />
        </Page>
      );
    }

    if (hasError) {
      return <RequestErrorMsg />;
    }

    return (
      <FrameworkConfiguration
        packageDetails={packageDetails}
        formData={formData}
        deployErrors={deployErrors}
        formErrors={formErrors}
        handleGoBack={this.handleGoBack}
        handleRun={this.handleRun}
        isInitialDeploy={true}
        onFormDataChange={this.onFormDataChange}
        onFormErrorChange={this.onFormErrorChange}
        onCosmosPackagesStoreInstallError={
          this.onCosmosPackagesStoreInstallError
        }
        isPending={this.state.isPending}
      />
    );
  }
}

DeployFrameworkConfiguration.contextTypes = {
  router: routerShape
};

export default DeployFrameworkConfiguration;
