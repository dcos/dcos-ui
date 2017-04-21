import mixin from "reactjs-mixin";
import { Link } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

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
  const version = cosmosPackage.getCurrentVersion();

  const crumbs = [
    <Breadcrumb key={0} title="Packages">
      <BreadcrumbTextContent>
        <Link to="/universe/packages">Packages</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={name}>
      <BreadcrumbTextContent>
        <Link to={`/universe/packages/${name}`} query={{ version }} key={0}>
          {name}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="packages" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = ["handleInstallModalClose", "handleInstallModalOpen"];

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
        events: ["descriptionError", "descriptionSuccess"],
        unmountWhen(store, event) {
          if (event === "descriptionSuccess") {
            return !!CosmosPackagesStore.get("packageDetails");
          }
        },
        listenAlways: false,
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    const { packageName } = this.props.params;
    const { version } = this.props.location.query;
    // Fetch package description
    CosmosPackagesStore.fetchPackageDescription(packageName, version);
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
    this.setState({ openInstallModal: true });
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
        <h5 className="flush-top">{label}</h5>
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

  getSelectedBadge(cosmosPackage, version) {
    const versionTag = <span>{version}</span>;

    if (cosmosPackage.isSelected()) {
      // TODO: Convert this to .pill-label.
      return (
        <span className="badge-container selected-badge">
          <span className="badge badge-large">
            Selected
          </span>
          {versionTag}
        </span>
      );
    }

    return versionTag;
  }

  getInstallButton(cosmosPackage) {
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
      <button
        className="button button-success"
        onClick={this.handleInstallModalOpen}
      >
        Install Package
      </button>
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
    const version = cosmosPackage.getCurrentVersion();
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
        <div className="media-object-spacing-wrapper">
          <div className="media-object media-object-align-middle">
            <div className="media-object-item">
              <div className="icon icon-huge icon-image-container icon-app-container icon-default-white">
                <Image
                  fallbackSrc={defaultServiceImage}
                  src={cosmosPackage.getIcons()["icon-large"]}
                />
              </div>
            </div>
            <div className="media-object-item">
              <h1 className="flush">
                {name}
              </h1>
              <p>{this.getSelectedBadge(cosmosPackage, version)}</p>
              {this.getInstallButton(cosmosPackage)}
            </div>
          </div>
        </div>
        <div className="pod pod-short flush-right flush-left">
          {this.getItems(definition, this.getItem)}
          <ImageViewer images={cosmosPackage.getScreenshots()} />
        </div>
        <InstallPackageModal
          open={state.openInstallModal}
          packageName={name}
          packageVersion={version}
          onClose={this.handleInstallModalClose}
        />
      </Page>
    );
  }
}

module.exports = PackageDetailTab;
