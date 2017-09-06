import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Dropdown, Tooltip } from "reactjs-components";

import { replaceQueryInPathString } from "#SRC/js/utils/RouterUtil";
import BetaOptInUtil from "../../utils/BetaOptInUtil";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import defaultServiceImage
  from "../../../../plugins/services/src/img/icon-service-default-large@2x.png";
import Image from "../../components/Image";
import ImageViewer from "../../components/ImageViewer";
import InstallPackageModal from "../../components/modals/InstallPackageModal";
import Loader from "../../components/Loader";
import MetadataStore from "../../stores/MetadataStore";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import StringUtil from "../../utils/StringUtil";

const PackageDetailBreadcrumbs = ({ cosmosPackage }) => {
  const name = cosmosPackage.getName();
  const version = cosmosPackage.getVersion();

  const crumbs = [
    <Breadcrumb key={0} title="Catalog">
      <BreadcrumbTextContent>
        <Link to="/catalog/packages">Catalog</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={name}>
      <BreadcrumbTextContent>
        <Link to={`/catalog/packages/${name}`} query={{ version }} key={0}>
          {name}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="packages" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = [
  "handleInstallModalClose",
  "handleConfigureInstallModalOpen",
  "handleInstallModalOpen",
  "handlePackageVersionChange"
];

class PackageDetailTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      hasError: 0,
      openInstallModal: false,
      isLoading: true
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: [
          "descriptionError",
          "descriptionSuccess",
          "listVersionsSuccess",
          "listVersionsError"
        ],
        suppressUpdate: false
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  isSelectedVersionLoading() {
    const { version } = this.props.location.query;
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();

    return cosmosPackage.getVersion() !== version;
  }

  retrievePackageInfo() {
    const { packageName } = this.props.params;
    const { version } = this.props.location.query;
    const cosmosPackagesVersions = CosmosPackagesStore.getPackagesVersions();
    const selectedPackage = cosmosPackagesVersions.getPackageVersionsByName(
      packageName
    );

    // fetch package versions available only if not cached
    if (Object.keys(selectedPackage).length < 1) {
      CosmosPackagesStore.fetchPackageVersions(packageName);
    }

    // Fetch package description
    CosmosPackagesStore.fetchPackageDescription(packageName, version);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.retrievePackageInfo();
  }

  componentDidUpdate(prevProps) {
    const { version } = this.props.location.query;

    if (version === prevProps.location.query.version) {
      return false;
    }

    this.retrievePackageInfo();
  }

  onCosmosPackagesStoreDescriptionError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    this.setState({ hasError: false, isLoading: false });
  }

  handleInstallModalClose() {
    this.setState({ openInstallModal: false });
  }

  handleInstallModalOpen() {
    this.setState({ openInstallModal: true, advancedConfig: false });
  }

  handleConfigureInstallModalOpen() {
    this.setState({ openInstallModal: true, advancedConfig: true });
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getItems(definition, renderItem) {
    const items = [];
    definition.forEach((item, index) => {
      const { label, type, value } = item;

      // When there is no content to render, discard it all together
      if (!value || (Array.isArray(value) && !value.length)) {
        return null;
      }

      // If not specific type assume value is renderable
      let content = value;

      // Render sub items
      if (type === "subItems") {
        content = this.getItems(value, this.getSubItem);
      }

      items.push(renderItem(label, content, index));
    });

    return items;
  }

  getItem(label, value, key) {
    if (!label || !value) {
      return null;
    }

    if (typeof value === "string") {
      value = <p className="flush">{value}</p>;
    }

    return (
      <div
        className="pod pod-shorter flush-top flush-right flush-left"
        key={key}
      >
        <h5 className="short-bottom">{label}</h5>
        {value}
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getSubItem(label, value, key) {
    let content = value;

    if (StringUtil.isEmail(value)) {
      content = <a key={key} href={`mailto:${value}`}>{value}</a>;
    }

    if (StringUtil.isUrl(value)) {
      content = <a key={key} href={value} target="_blank">{value}</a>;
    }

    return <p key={key} className="short">{`${label}: `}{content}</p>;
  }

  mapLicenses(licenses) {
    return licenses.map(function(license) {
      const item = {
        label: license.name,
        value: license.url
      };

      return item;
    });
  }

  getPackageBadge(cosmosPackage) {
    const isCertified = cosmosPackage.isCertified();
    const badgeCopy = isCertified ? "Certified" : "Community";
    const badgeClasses = classNames("badge badge-large badge-rounded", {
      "badge--primary": isCertified
    });

    return (
      <span className="column-3 badge-container selected-badge">
        <span className={badgeClasses}>
          {badgeCopy}
        </span>
      </span>
    );
  }

  getInstallButtons(cosmosPackage) {
    const tooltipContent = "loading selected version";

    if (cosmosPackage.isCLIOnly()) {
      return (
        <div>
          <p>CLI Only Package</p>
          <p>
            {"This package can only be installed using the CLI. See the "}
            <a
              href={MetadataStore.buildDocsURI(
                "/usage/managing-services/install/#installing-a-service-using-the-cli"
              )}
              target="_blank"
            >
              documentation
            </a>.
          </p>
        </div>
      );
    }

    return (
      <div className="button-collection">
        <Tooltip
          wrapperClassName="button-group"
          wrapText={true}
          content={tooltipContent}
          suppress={!this.isSelectedVersionLoading()}
        >
          <button
            disabled={this.isSelectedVersionLoading()}
            className="button button-outline"
            onClick={this.handleConfigureInstallModalOpen}
          >
            Configure
          </button>
        </Tooltip>
        <Tooltip
          wrapperClassName="button-group"
          wrapText={true}
          content={tooltipContent}
          suppress={!this.isSelectedVersionLoading()}
        >
          <button
            disabled={this.isSelectedVersionLoading()}
            className="button button-primary"
            onClick={this.handleInstallModalOpen}
          >
            Deploy
          </button>
        </Tooltip>
      </div>
    );
  }

  getTermsConditionUrl() {
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();

    if (cosmosPackage.isCertified()) {
      return "https://mesosphere.com/catalog-terms-conditions/#certified-services";
    } else {
      return "https://mesosphere.com/catalog-terms-conditions/#community-services";
    }
  }

  handlePackageVersionChange(packageOpt) {
    const packageVersion = packageOpt.id;
    const newPathname = replaceQueryInPathString({
      pathname: global.location.hash,
      query: "version",
      value: packageVersion
    });

    global.location.replace(newPathname);
  }

  getPackageVersionsDropdown() {
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    const packageName = cosmosPackage.getName();
    const cosmosPackagesVersions = CosmosPackagesStore.getPackagesVersions();
    const selectedVersion = cosmosPackage.getVersion();
    const selectedPackageVersions = cosmosPackagesVersions
      .getPackageVersionsByName(packageName)
      .map(version => {
        return {
          html: version,
          id: version
        };
      });

    if (selectedPackageVersions.length === 0) {
      return null;
    }

    return (
      <Dropdown
        buttonClassName="button button-link dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        onItemSelection={this.handlePackageVersionChange}
        items={selectedPackageVersions}
        initialID={selectedVersion}
        transition={true}
        wrapperClassName="dropdown"
      />
    );
  }

  getPackageDescription(definition, cosmosPackage) {
    return (
      <div className="pod flush-horizontal flush-bottom">
        {this.getItems(definition, this.getItem)}
        <ImageViewer images={cosmosPackage.getScreenshots()} />
      </div>
    );
  }

  render() {
    const { props, state } = this;

    if (state.hasError || !props.params.packageName) {
      return this.getErrorScreen();
    }

    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    if (state.isLoading || !cosmosPackage) {
      return this.getLoadingScreen();
    }

    const name = cosmosPackage.getName();
    const description = cosmosPackage.getDescription();
    const preInstallNotes = cosmosPackage.getPreInstallNotes();

    const definition = [
      {
        label: "Description",
        value: description &&
          <div
            dangerouslySetInnerHTML={StringUtil.parseMarkdown(description)}
          />
      },
      {
        label: "Pre-Install Notes",
        value: preInstallNotes &&
          <div
            dangerouslySetInnerHTML={StringUtil.parseMarkdown(preInstallNotes)}
          />
      },
      {
        label: "Information",
        type: "subItems",
        value: [
          { label: "SCM", value: cosmosPackage.getSCM() },
          { label: "Maintainer", value: cosmosPackage.getMaintainer() }
        ]
      },
      {
        label: "Licenses",
        type: "subItems",
        value: this.mapLicenses(cosmosPackage.getLicenses())
      }
    ];

    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PackageDetailBreadcrumbs cosmosPackage={cosmosPackage} />
          }
        />
        <div className="container">
          <div className="media-object-spacing-wrapper media-object-spacing-wide media-object-offset">
            <div className="media-object media-object-align-top media-object-wrap">
              <div className="media-object-item">
                <div className="icon icon-huge icon-image-container icon-app-container icon-app-container--borderless icon-default-white">
                  <Image
                    fallbackSrc={defaultServiceImage}
                    src={cosmosPackage.getIcons()["icon-large"]}
                  />
                </div>
              </div>
              <div className="media-object-item media-object-item-grow">
                <div className="flex flex-direction-left-to-right">
                  <h1 className="short flush-top">
                    {name}
                  </h1>
                  {this.getPackageVersionsDropdown()}
                </div>
                <div className="row">
                  {this.getPackageBadge(cosmosPackage)}
                </div>
              </div>
              <div className="media-object-item package-action-buttons">
                {this.getInstallButtons(cosmosPackage)}
                <small>
                  By deploying you agree to the {" "}
                  <a
                    href={this.getTermsConditionUrl()}
                    target="_blank"
                    title="Terms and Conditions"
                  >
                    terms and conditions
                  </a>
                </small>
              </div>
            </div>
          </div>
          {this.isSelectedVersionLoading()
            ? this.getLoadingScreen()
            : this.getPackageDescription(definition, cosmosPackage)}
        </div>
        <InstallPackageModal
          open={state.openInstallModal}
          cosmosPackage={cosmosPackage}
          advancedConfig={state.advancedConfig}
          isBetaPackage={BetaOptInUtil.isBeta(cosmosPackage.getConfig())}
          onClose={this.handleInstallModalClose}
        />
      </Page>
    );
  }
}

module.exports = PackageDetailTab;
