import qs from "query-string";
import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Dropdown, Tooltip, Modal } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import defaultServiceImage
  from "#PLUGINS/services/src/img/icon-service-default-large@2x.png";
import Image from "#SRC/js/components/Image";
import ImageViewer from "#SRC/js/components/ImageViewer";
import Loader from "#SRC/js/components/Loader";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StringUtil from "#SRC/js/utils/StringUtil";
import { Badge } from "@dcos/ui-kit/dist/components";

const semver = require("semver");

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

  return <Page.Header.Breadcrumbs iconID="catalog" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = [
  "handlePackageVersionChange",
  "handleReviewAndRunClick",
  "onInstalledSuccessModalClose"
];

class PackageDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      hasError: 0,
      isLoadingSelectedVersion: false,
      isLoadingVersions: false
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: [
          "packageDescriptionError",
          "packageDescriptionSuccess",
          "listVersionsSuccess",
          "listVersionsError"
        ],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  retrievePackageInfo(packageName, version) {
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    const packageVersions = CosmosPackagesStore.getPackageVersions(packageName);

    // Fetch package versions if necessary
    if (packageVersions == null) {
      this.setState({ isLoadingVersions: true });

      CosmosPackagesStore.fetchPackageVersions(packageName);
    }
    // Fetch new description if name or version changed
    if (
      cosmosPackage == null ||
      packageName !== cosmosPackage.getName() ||
      version !== cosmosPackage.getVersion()
    ) {
      this.setState({ isLoadingSelectedVersion: true });

      CosmosPackagesStore.fetchPackageDescription(packageName, version);
    }
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    this.retrievePackageInfo(
      this.props.params.packageName,
      this.props.location.query.version
    );
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);

    this.retrievePackageInfo(
      nextProps.params.packageName,
      nextProps.location.query.version
    );
  }

  onCosmosPackagesStorePackageDescriptionError() {
    this.setState({ hasError: true });
  }

  onCosmosPackagesStorePackageDescriptionSuccess() {
    this.setState({
      hasError: false,
      isLoadingSelectedVersion: false
    });
  }

  onCosmosPackagesStoreListVersionsSuccess() {
    this.setState({ isLoadingVersions: false });
  }

  handleReviewAndRunClick() {
    const { router } = this.context;
    const { params, location } = this.props;

    router.push(
      `/catalog/packages/${encodeURIComponent(params.packageName)}/deploy?version=${location.query.version}`
    );
  }

  handlePackageVersionChange(selection) {
    const query = Object.assign({}, this.props.location.query, {
      version: selection.id
    });

    global.location.replace(
      `#${this.props.location.pathname}?${qs.stringify(query)}`
    );
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
      value = (
        <p className="flush">
          {value}
        </p>
      );
    }

    return (
      <div
        className="pod pod-shorter flush-top flush-right flush-left"
        key={key}
      >
        <h2 className="short-bottom">
          {label}
        </h2>
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
      content = (
        <a key={key} href={`mailto:${value}`}>
          {value}
        </a>
      );
    }

    if (StringUtil.isUrl(value)) {
      content = (
        <a key={key} href={value} target="_blank">
          {value}
        </a>
      );
    }

    return (
      <p key={key} className="short">
        {`${label}: `}
        {content}
      </p>
    );
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
    const appearance = isCertified ? "primary" : "default";

    return (
      <span className="column-3">
        <Badge appearance={appearance}>{badgeCopy}</Badge>
      </span>
    );
  }

  getInstallButtons(cosmosPackage) {
    if (cosmosPackage.isCLIOnly()) {
      return (
        <div>
          <p>CLI Only Package</p>
          <p>
            {"This package can only be installed using the CLI. See the "}
            <a
              href={MetadataStore.buildDocsURI(
                "/cli/command-reference/dcos-service/"
              )}
              target="_blank"
            >
              documentation
            </a>.
          </p>
        </div>
      );
    }

    const { isLoadingSelectedVersion } = this.state;
    let tooltipContent = "";
    let installButtonIsDisabled = false;

    if (isLoadingSelectedVersion) {
      tooltipContent = "Loading selected version";
      installButtonIsDisabled = true;
    }

    if (
      MetadataStore.version &&
      cosmosPackage.minDcosReleaseVersion &&
      semver.compare(
        semver.coerce(MetadataStore.version),
        semver.coerce(cosmosPackage.minDcosReleaseVersion)
      ) < 0
    ) {
      tooltipContent = `This version of ${cosmosPackage.getName()} requires DC/OS
        version ${cosmosPackage.minDcosReleaseVersion} or higher, but you are
        running DC/OS version ${semver.coerce(MetadataStore.version)}`;
      installButtonIsDisabled = true;
    }

    return (
      <div className="button-collection">
        <Tooltip
          wrapperClassName="button-group"
          wrapText={true}
          content={tooltipContent}
          suppress={!installButtonIsDisabled}
          width={200}
        >
          <button
            disabled={installButtonIsDisabled}
            className="button button-primary"
            onClick={this.handleReviewAndRunClick}
          >
            Review & Run
          </button>
        </Tooltip>
      </div>
    );
  }

  getPackageVersionsDropdown() {
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    const packageName = cosmosPackage.getName();
    const packageVersions = CosmosPackagesStore.getPackageVersions(packageName);

    if (packageVersions == null) {
      return null;
    }

    const selectedVersion = cosmosPackage.getVersion();
    const availableVersions = packageVersions.getVersions().map(version => {
      return {
        html: version,
        id: version
      };
    });

    if (availableVersions.length === 0) {
      return null;
    }

    return (
      <Dropdown
        buttonClassName="button button-link dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        onItemSelection={this.handlePackageVersionChange}
        items={availableVersions}
        persistentID={selectedVersion}
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

  onInstalledSuccessModalClose() {
    const query = Object.assign({}, this.props.location.query);
    delete query.appId;

    global.location.replace(
      `#${this.props.location.pathname}?${qs.stringify(query)}`
    );
  }

  getInstalledSuccessModal(name) {
    const { location } = this.props;

    return (
      <Modal
        modalClass={"modal modal-small"}
        open={!!location.query.appId}
        onClose={this.onInstalledSuccessModalClose}
      >
        <div className="modal-install-package-tab-form-wrapper">
          <div className="modal-body">
            <div className="horizontal-center">
              <span className="text-success">
                <Icon id="circle-check" size="large" color="green" />
              </span>
              <h2 className="short-top short-bottom">Success!</h2>
              <div className="install-package-modal-package-notes text-overflow-break-word">
                {`${StringUtil.capitalize(name)} is being installed.`}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="button-collection button-collection-stacked horizontal-center">
              <a
                className="button button-success button-block"
                href={`#/services/detail/${encodeURIComponent(location.query.appId)}`}
              >
                Open Service
              </a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  render() {
    const { props, state } = this;

    if (state.hasError || !props.params.packageName) {
      return this.getErrorScreen();
    }

    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    if (!cosmosPackage) {
      return this.getLoadingScreen();
    }

    const name = cosmosPackage.getName();
    const description = cosmosPackage.getDescription();
    const preInstallNotes = cosmosPackage.getPreInstallNotes();

    let preInstallNotesParsed = null;
    if (preInstallNotes) {
      preInstallNotesParsed = StringUtil.parseMarkdown(preInstallNotes);
      preInstallNotesParsed.__html =
        "<strong>Preinstall Notes: </strong>" + preInstallNotesParsed.__html;
    }

    const definition = [
      {
        label: "Description",
        value: description &&
          <div
            dangerouslySetInnerHTML={StringUtil.parseMarkdown(description)}
          />
      },
      {
        label: " ",
        value: preInstallNotes &&
          <div
            className="pre-install-notes flush-bottom message message-warning"
            dangerouslySetInnerHTML={preInstallNotesParsed}
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
              </div>
            </div>
          </div>
          {state.isLoadingSelectedVersion
            ? this.getLoadingScreen()
            : this.getPackageDescription(definition, cosmosPackage)}
        </div>
        {this.getInstalledSuccessModal(name)}
      </Page>
    );
  }
}

PackageDetailTab.contextTypes = {
  router: routerShape
};

module.exports = PackageDetailTab;
