import { withI18n } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import DetailViewHeader from "#SRC/js/components/DetailViewHeader";
import Loader from "#SRC/js/components/Loader";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import AuthProviderDetailTab from "../components/AuthProviderDetailTab";
import AuthProviderStore from "../stores/AuthProviderStore";
import AuthProvidersModal from "../components/AuthProvidersModal";
import ProviderTypes from "../constants/ProviderTypes";

const AuthProviderDetailBreadcrumbs = ({ provider }) => {
  const { providerType, providerID } = provider;

  const crumbs = [
    <Breadcrumb key={0} title="Identity Providers">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/identity-providers" />}>
          Identity Providers
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={providerID}>
      <BreadcrumbTextContent>
        <Link
          to={`/settings/identity-providers/${providerType}/${providerID}`}
          key={0}
        >
          {providerID}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Gear} breadcrumbs={crumbs} />
  );
};

class AuthProviderDetailPage extends mixin(StoreMixin) {
  static contextTypes = {
    router: routerShape
  };
  constructor(...args) {
    super(...args);

    this.state = {
      deleteUpdateError: null,
      fetchedDetailsError: false,
      openDeleteConfirmation: false,
      openEditFormModal: false,
      pendingRequest: false
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "authProvider", events: ["success", "error", "deleteSuccess", "deleteError", "callbackUrlSuccess", "updateSuccess"], suppressUpdate: true},
      {name: "summary", events: ["success"], unmountWhen: (store, event) => event === "success" && store.get("statesProcessed") }
    ];
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
    const { providerID, providerType } = this.props.params;

    AuthProviderStore.fetch(providerType, providerID);

    if (providerType === "saml") {
      AuthProviderStore.fetchCallbackURL(providerID);
    }
  }
  handleDeleteCancel = () => {
    this.setState({
      openDeleteConfirmation: false
    });
  };
  handleDeleteModalOpen = () => {
    this.setState({
      deleteUpdateError: null,
      openDeleteConfirmation: true
    });
  };
  handleDeleteProvider = () => {
    const { providerID, providerType } = this.props.params;

    this.setState({
      pendingRequest: true
    });

    AuthProviderStore.delete(providerType, providerID);
  };
  handleEditModalOpen = () => {
    this.setState({
      openEditFormModal: true
    });
  };
  handleEditCancel = () => {
    this.setState({
      openEditFormModal: false
    });
  };

  onAuthProviderStoreDeleteError(error) {
    this.setState({
      deleteUpdateError: error,
      pendingRequest: false
    });
  }

  onAuthProviderStoreDeleteSuccess() {
    this.setState({
      openDeleteConfirmation: false,
      pendingRequest: false
    });

    this.context.router.push("/settings/identity-providers");
  }

  onAuthProviderStoreSuccess() {
    this.setState({ fetchedDetailsError: false });
  }

  onAuthProviderStoreError(error, providerID) {
    if (providerID === this.props.params.providerID) {
      this.setState({ fetchedDetailsError: true });
    }
  }

  onAuthProviderStoreUpdateSuccess(providerID, providerType) {
    AuthProviderStore.fetch(providerType, providerID);

    if (providerType === "saml") {
      AuthProviderStore.fetchCallbackURL(providerID);
    }
  }

  onAuthProviderStoreCallbackUrlSuccess() {
    this.forceUpdate();
  }

  getActions() {
    return [
      {
        label: "Edit",
        onItemSelect: this.handleEditModalOpen
      },
      {
        label: StringUtil.capitalize(UserActions.DELETE),
        onItemSelect: this.handleDeleteModalOpen
      }
    ];
  }

  getDeleteModalContent() {
    let error = null;

    if (this.state.deleteUpdateError != null) {
      error = (
        <p className="text-error-state">{this.state.deleteUpdateError}</p>
      );
    }

    const provider = this.getProvider();

    return (
      <div>
        <p>{`${provider.description} will be ${UserActions.DELETED}.`}</p>
        {error}
      </div>
    );
  }

  getErrorNotice() {
    const breadcrumbs = (
      <AuthProviderDetailBreadcrumbs provider={this.props.params} />
    );

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <RequestErrorMsg />
      </Page>
    );
  }

  getProvider() {
    const { providerID, providerType } = this.props.params;

    return AuthProviderStore.getProvider(providerType, providerID);
  }

  getSubTitle() {
    const { i18n, params } = this.props;
    const { providerType } = params;

    return i18n._(ProviderTypes[providerType].description);
  }

  render() {
    const { providerType } = this.props.params;

    if (this.state.fetchedDetailsError) {
      return this.getErrorNotice();
    }

    const provider = this.getProvider();

    if (provider == null) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={
              <AuthProviderDetailBreadcrumbs provider={this.props.params} />
            }
          />
          <Loader />
        </Page>
      );
    }

    const confirmHeading = (
      <ModalHeading>
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );
    const providerIcon = ProviderTypes[providerType];

    const breadcrumbs = (
      <AuthProviderDetailBreadcrumbs provider={this.props.params} />
    );

    return (
      <Page>
        <Page.Header actions={this.getActions()} breadcrumbs={breadcrumbs} />
        <div className="flex-container-col">
          <DetailViewHeader
            icon={<providerIcon.icon />}
            iconClassName="icon-app-container icon-image-container"
            subTitle={this.getSubTitle()}
            title={provider.getDescription()}
          />

          <AuthProviderDetailTab provider={this.getProvider()} />
          <Confirm
            closeByBackdropClick={true}
            disabled={this.state.pendingRequest}
            header={confirmHeading}
            open={this.state.openDeleteConfirmation}
            onClose={this.handleDeleteCancel}
            leftButtonCallback={this.handleDeleteCancel}
            leftButtonClassName="button button-primary-link flush-left"
            rightButtonCallback={this.handleDeleteProvider}
            rightButtonClassName="button button-danger"
            rightButtonText={StringUtil.capitalize(UserActions.DELETE)}
            showHeader={true}
          >
            {this.getDeleteModalContent()}
          </Confirm>
          <AuthProvidersModal
            onClose={this.handleEditCancel}
            open={this.state.openEditFormModal}
            provider={provider}
            selectedProviderType={providerType}
          />
        </div>
      </Page>
    );
  }
}

export default withI18n()(AuthProviderDetailPage);
