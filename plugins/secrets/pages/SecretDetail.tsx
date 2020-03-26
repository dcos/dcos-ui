import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
import * as React from "react";
import PropTypes from "prop-types";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import SecretActionsModal from "../components/SecretActionsModal";
import SecretFormModal from "../components/SecretFormModal";
import getSecretStore from "../stores/SecretStore";
import SecretsError from "../components/SecretsError";
import PrivatePluginsConfig from "../../PrivatePluginsConfig";

const SecretStore = getSecretStore();

const SecretDetailBreadcrumbs = ({ secretPath }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Secrets">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/secrets" key={0} />}>Secrets</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={secretPath}>
      <BreadcrumbTextContent>
        <Link to={`/secrets/${encodeURIComponent(secretPath)}`}>
          {secretPath}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Lock} breadcrumbs={crumbs} />
  );
};

const SecretsDetailPageLayout = ({ path, actions, children }) => (
  <Page>
    <Page.Header
      breadcrumbs={
        <SecretDetailBreadcrumbs secretPath={decodeURIComponent(path)} />
      }
      actions={actions}
    />
    {children}
  </Page>
);

const PermissionErrorMessage = () => {
  const header = i18nMark("Permission denied");

  const message = (
    <Trans render="p" className="text-align-center flush-bottom">
      You do not have permission to see this secret.
      <br />
      Please contact your super admin to learn more.
    </Trans>
  );

  return <RequestErrorMsg header={header} message={message} />;
};

SecretsDetailPageLayout.propTypes = {
  path: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      onItemSelect: PropTypes.func.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

const SecretsDetailPageLoading = ({ path }) => (
  <SecretsDetailPageLayout path={path}>
    <Loader />
  </SecretsDetailPageLayout>
);

class SecretDetail extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      hideSecret: true,
      removeSecretOpen: false,
      loading: true,
      secretFormOpen: false,
      requestErrorType: null,
      secret: null,
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "secrets", events: ["secretDetailSuccess", "updateSecretSuccess", "secretDetailError"]}
    ];
  }

  componentDidMount() {
    super.componentDidMount();
    this.fetchSecretDetail(this.props);
  }

  onSecretsStoreUpdateSecretSuccess() {
    this.fetchSecretDetail(this.props);
  }

  onSecretsStoreSecretDetailSuccess() {
    const secret = SecretStore.getSecretDetail();
    this.setState({ loading: false, secret });
  }

  onSecretsStoreSecretDetailError(error) {
    if (this.isForbiddenError(error)) {
      this.setState({ requestErrorType: "permission" });
    } else {
      this.setState({ requestErrorType: "failure" });
    }
  }

  isForbiddenError(error) {
    return error && error.code === 403;
  }
  handleEditClick = () => {
    this.setState({ editSecretOpen: true });
  };
  handleEditClose = () => {
    this.setState({ editSecretOpen: false });
  };
  handleRemoveClick = () => {
    this.setState({ removeSecretOpen: true });
  };
  handleRemoveClose = () => {
    SecretStore.fetchSecrets();
    this.setState({ removeSecretOpen: false });
    this.context.router.push("/secrets");
  };
  handleSecretToggle = () => {
    this.setState({ hideSecret: !this.state.hideSecret });
  };

  fetchSecretDetail(props) {
    this.setState({ loading: true, requestErrorType: null });

    let { secretPath } = props.params;
    secretPath = decodeURIComponent(secretPath);
    SecretStore.fetchSecret(
      PrivatePluginsConfig.secretsDefaultStore,
      secretPath
    );
  }

  getActionButtons() {
    const actions = [];
    actions.push({
      onItemSelect: this.handleEditClick,
      label: "Edit",
    });
    actions.push({
      className: "text-danger",
      onItemSelect: this.handleRemoveClick,
      label: StringUtil.capitalize(UserActions.DELETE),
    });

    return actions;
  }

  getSecretDetails(secret) {
    const description = secret.getDescription();
    const store = secret.getStore();
    const path = secret.getPath();

    let descriptionRow = null;
    let storeRow = null;
    let creationDetailsRow = null;

    if (description != null) {
      descriptionRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">Description</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{description}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (store != null) {
      storeRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">Store</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{store}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (secret.getCreatedAt() != null && secret.getAuthor() != null) {
      creationDetailsRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">Created</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {secret.getCreatedAt()} by {secret.getAuthor()}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>
            {storeRow}
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render={<ConfigurationMapLabel />}>Path</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>{path}</ConfigurationMapValue>
            </ConfigurationMapRow>
            {descriptionRow}
            {creationDetailsRow}
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                {secret.isBinary() ? <Trans>File</Trans> : <Trans>Value</Trans>}
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {secret.isBinary() ? (
                  <React.Fragment>
                    <a
                      className="button button-primary-link button-flush"
                      onClick={this.triggerSecretDownload}
                    >
                      <Icon
                        shape="system-download"
                        size="16px"
                        ariaLabel="Donwload"
                      />
                      <Trans>Download</Trans>
                    </a>
                  </React.Fragment>
                ) : (
                  <div>
                    {this.getSecretIcon()}
                    {this.getSecretValue(secret)}
                  </div>
                )}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }

  getSecretValue(secret) {
    if (this.state.hideSecret) {
      return "••••••••";
    }

    return secret.getValue();
  }

  getSecretIcon() {
    const iconID = this.state.hideSecret
      ? SystemIcons.Eye
      : SystemIcons.EyeSlash;

    return (
      <span
        className="secret-toggle clickable"
        onClick={this.handleSecretToggle}
      >
        <Icon color={greyDark} shape={iconID} size={iconSizeXs} />
      </span>
    );
  }
  triggerSecretDownload = () => {
    const { secretPath } = this.props.params;

    window.location.href = `/secrets/v1/secret/${
      PrivatePluginsConfig.secretsDefaultStore
    }/${decodeURIComponent(secretPath)}`;
  };

  handleSecretFormOpen() {
    this.setState({ secretFormOpen: true });
  }

  handleSecretFormClose() {
    this.setState({ secretFormOpen: false });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.fetchSecretDetail(nextProps);
  }

  render() {
    const { requestErrorType, secretFormOpen, secret } = this.state;

    if (requestErrorType !== null) {
      return (
        <SecretsError
          type={requestErrorType}
          open={secretFormOpen}
          openModal={this.handleSecretFormOpen}
          closeModal={this.handleSecretFormClose}
          breadcrumbs={<SecretDetailBreadcrumbs />}
          permissionErrorMessage={<PermissionErrorMessage />}
        />
      );
    }

    if (secret == null || this.state.loading) {
      return (
        <SecretsDetailPageLoading
          path={decodeURIComponent(this.props.params.secretPath)}
        />
      );
    }

    const { editSecretOpen, removeSecretOpen } = this.state;

    return (
      <SecretsDetailPageLayout
        path={decodeURIComponent(this.props.params.secretPath)}
        actions={this.getActionButtons()}
      >
        {this.getSecretDetails(secret)}
        <SecretFormModal
          onClose={this.handleEditClose}
          open={editSecretOpen}
          secret={secret}
        />
        <SecretActionsModal
          itemID="path"
          action={UserActions.DELETE}
          onClose={this.handleRemoveClose}
          selectedItems={[secret]}
          open={removeSecretOpen}
        />
      </SecretsDetailPageLayout>
    );
  }
}

SecretDetail.contextTypes = {
  router: routerShape,
};

export default SecretDetail;
