import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Page from "#SRC/js/components/Page";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLDirectoriesStore from "../stores/ACLDirectoriesStore";
import DirectoryActionButtons from "../components/DirectoryActionButtons";
import DirectoryFormModal from "../components/DirectoryFormModal";
import FieldDefinitions from "../constants/FieldDefinitions";

const DirectoriesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={-1} title="Directory">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/directory" key={-1} />}>
          LDAP Directory
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Users} breadcrumbs={crumbs} />
  );
};

export default class DirectoriesPage extends mixin(StoreMixin) {
  static routeConfig = {
    label: i18nMark("LDAP Directory"),
    matches: /^\/settings\/directory/
  };
  constructor(...args) {
    super(...args);

    this.state = {
      modalEditMode: false,
      modalDisabled: false,
      modalOpen: false,
      showValue: {}
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "aclDirectories", events: ["fetchSuccess", "addSuccess", "addError", "deleteSuccess"]}
    ];
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
    ACLDirectoriesStore.fetchDirectories();
  }

  onAclDirectoriesStoreAddSuccess() {
    this.changeModalOpenState(false);
    ACLDirectoriesStore.fetchDirectories();
  }

  onAclDirectoriesStoreAddError() {
    this.setState({ modalDisabled: false });
  }
  handleConfigurationEditClick = () => {
    this.setState({ modalEditMode: true });
    this.changeModalOpenState(true);
  };

  handleDirectoryDelete() {
    ACLDirectoriesStore.deleteDirectory();
  }

  handleDirectoryTestConnection() {
    ACLDirectoriesStore.testDirectoryConnection();
  }
  handleFormSubmit = () => {
    this.setState({ modalDisabled: true });
  };
  handleSecretToggle = fieldName => {
    const { showValue } = this.state;

    this.setState({ ...showValue, [fieldName]: !showValue[fieldName] });
  };
  changeModalOpenState = open => {
    this.setState({ modalOpen: open, modalDisabled: false });
  };

  getDirectoryFormModal(directoryConfig) {
    return (
      <DirectoryFormModal
        editMode={this.state.modalEditMode}
        model={directoryConfig}
        modalDisabled={this.state.modalDisabled}
        modalOpen={this.state.modalOpen}
        onFormSubmit={this.handleFormSubmit}
        changeModalOpenState={this.changeModalOpenState}
      />
    );
  }

  getDirectoryDetails(directoryConfig) {
    // Ordering mirrors that of `DirectoryFormModal`,
    // omitting `lookup-password`.
    // See: DirectoryFormModal.getModalFormDefinition()
    let clientCertRow = null;
    let caCertRow = null;
    let sslTLSValue =
      FieldDefinitions["ssl-tls-configuration-default-value"].displayName;
    let groupSearchSection = null;
    let userSearchSection = null;

    const clientCertValue = this.getSecretValue("client-cert");
    const caCertValue = this.getSecretValue("ca-certs");

    if (directoryConfig["use-ldaps"]) {
      sslTLSValue = FieldDefinitions["use-ldaps"].displayName;
    } else if (directoryConfig["enforce-starttls"]) {
      sslTLSValue = FieldDefinitions["enforce-starttls"].displayName;
    }

    if (directoryConfig["user-search"]) {
      userSearchSection = (
        <ConfigurationMapSection key="user-search">
          <ConfigurationMapHeading>
            <Trans render="span">User Search</Trans>
          </ConfigurationMapHeading>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans
                render="span"
                id={FieldDefinitions["user-search.search-base"].displayName}
              />
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {directoryConfig["user-search"]["search-base"]}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans
                render="span"
                id={
                  FieldDefinitions["user-search.search-filter-template"]
                    .displayName
                }
              />
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {directoryConfig["user-search"]["search-filter-template"]}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        </ConfigurationMapSection>
      );
    }

    if (directoryConfig["group-search"]) {
      groupSearchSection = (
        <ConfigurationMapSection key="group-search">
          <ConfigurationMapHeading>
            <Trans render="span">Group Search</Trans>
          </ConfigurationMapHeading>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans
                render="span"
                id={FieldDefinitions["group-search.search-base"].displayName}
              />
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {directoryConfig["group-search"]["search-base"]}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans
                render="span"
                id={
                  FieldDefinitions["group-search.search-filter-template"]
                    .displayName
                }
              />
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {directoryConfig["group-search"]["search-filter-template"]}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        </ConfigurationMapSection>
      );
    }

    if (clientCertValue != null) {
      clientCertRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">Client Secret</Trans>{" "}
            {this.getSecretIcon("client-cert")}
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{clientCertValue}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    if (caCertValue != null) {
      caCertRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">CA Certificate</Trans>{" "}
            {this.getSecretIcon("ca-certs")}
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{caCertValue}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    return [
      <ConfigurationMapSection key="general-section">
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">{FieldDefinitions.host.displayName}</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{directoryConfig.host}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">{FieldDefinitions.port.displayName}</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{directoryConfig.port}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span">SSL/TLS Setting</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            <Trans render="span" id={sslTLSValue} />
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        {clientCertRow}
        {caCertRow}
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans
              render="span"
              id={FieldDefinitions["lookup-dn"].displayName}
            />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {directoryConfig["lookup-dn"]}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span" id={FieldDefinitions.dntemplate.displayName} />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {directoryConfig.dntemplate}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>,
      userSearchSection,
      groupSearchSection
    ];
  }

  getSecretIcon(fieldName) {
    const iconID = this.state.showValue[fieldName]
      ? SystemIcons.EyeSlash
      : SystemIcons.Eye;

    return (
      <span
        className="secret-toggle clickable"
        onClick={this.handleSecretToggle.bind(this, fieldName)}
      >
        <Icon color={greyDark} shape={iconID} size={iconSizeXs} />
      </span>
    );
  }

  getSecretValue(fieldName) {
    const secretValue = ACLDirectoriesStore.getDirectories().getItems()[0][
      fieldName
    ];

    if (this.state.showValue[fieldName]) {
      return <pre>{secretValue}</pre>;
    }
    if (secretValue) {
      return "••••••••";
    }
  }

  renderDirectory(directoryConfig) {
    return (
      <div className="container">
        <DirectoryActionButtons
          onConfigurationEditClick={this.handleConfigurationEditClick}
        />
        <ConfigurationMap>
          <ConfigurationMapHeading>
            <Trans render="span">External LDAP Configuration</Trans>
          </ConfigurationMapHeading>
          {this.getDirectoryDetails(directoryConfig)}
        </ConfigurationMap>
      </div>
    );
  }

  renderAddDirectory(directoryConfig) {
    return (
      <Page>
        <Page.Header breadcrumbs={<DirectoriesBreadcrumbs />} />
        <AlertPanel>
          <AlertPanelHeader>
            <Trans render="span">No directory configured</Trans>
          </AlertPanelHeader>
          <Trans render="p" className="tall">
            Set up an LDAP connection to avoid having to recreate your user
            accounts within DC/OS.
          </Trans>
          <div className="button-collection flush-bottom">
            <button
              className="button button-primary"
              onClick={this.changeModalOpenState.bind(null, true)}
            >
              <Trans render="span">Add Directory</Trans>
            </button>
          </div>
        </AlertPanel>
        {this.getDirectoryFormModal(directoryConfig)}
      </Page>
    );
  }

  render() {
    const directories = ACLDirectoriesStore.getDirectories().getItems();
    const directoryConfig = directories[0];

    if (!directories.length) {
      return this.renderAddDirectory(directoryConfig);
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<DirectoriesBreadcrumbs />} />
        {this.renderDirectory(directoryConfig)}
        {this.getDirectoryFormModal(directoryConfig)}
      </Page>
    );
  }
}
