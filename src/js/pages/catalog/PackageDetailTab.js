import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import qs from "query-string";
import mixin from "reactjs-mixin";
import { Link, routerShape } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Dropdown, Tooltip, Modal } from "reactjs-components";
import { Badge, Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import {
  green,
  iconSizeL,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import classNames from "classnames";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import Image from "#SRC/js/components/Image";
import ImageViewer from "#SRC/js/components/ImageViewer";
import Loader from "#SRC/js/components/Loader";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StringUtil from "#SRC/js/utils/StringUtil";
import defaultServiceImage from "#PLUGINS/services/src/img/icon-service-default-large@2x.png";
import { DCOS_CHANGE } from "#SRC/js/constants/EventTypes";

const semver = require("semver");

const runningServicesNames = (labels = []) =>
  labels
    .filter(label => label.key === "DCOS_SERVICE_NAME")
    .map(label => label.value);

const PackageDetailBreadcrumbs = ({ cosmosPackage, isLoading }) => {
  const name = cosmosPackage.getName();
  const version = cosmosPackage.getVersion();

  const crumbs = [
    <Breadcrumb key={0} title="Catalog">
      <BreadcrumbTextContent>
        <Link to="/catalog/packages">
          <Trans render="span">Catalog</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={!isLoading && name}>
      {!isLoading && (
        <BreadcrumbTextContent>
          <Link to={`/catalog/packages/${name}`} query={{ version }} key={0}>
            {name}
          </Link>
        </BreadcrumbTextContent>
      )}
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Packages}
      breadcrumbs={crumbs}
    />
  );
};

const METHODS_TO_BIND = [
  "renderReviewAndRunButton",
  "handlePackageVersionChange",
  "handleReviewAndRunClick",
  "hasUnresolvedDependency",
  "onInstalledSuccessModalClose",
  "onStoreChange",
  "renderInstallButton",
  "renderReviewAndRunButton"
];

class PackageDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      hasError: 0,
      isLoadingSelectedVersion: false,
      isLoadingVersions: false,
      runningPackageNames: { state: "loading" }
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

  onStoreChange() {
    this.setState({
      runningPackageNames: {
        state: "success",
        data: runningServicesNames(DCOSStore.serviceTree.getLabels())
      }
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    DCOSStore.addChangeListener(DCOS_CHANGE, this.onStoreChange);
    this.retrievePackageInfo(
      this.props.params.packageName,
      this.props.location.query.version
    );
  }

  componentWillUnmount() {
    DCOSStore.removeChangeListener(DCOS_CHANGE, this.onStoreChange);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    super.UNSAFE_componentWillReceiveProps(...arguments);

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
      `/catalog/packages/${encodeURIComponent(
        params.packageName
      )}/deploy?${qs.stringify({ version: location.query.version })}`
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
      value = <p className="flush">{value}</p>;
    }

    return (
      <div
        className="pod pod-shorter flush-top flush-right flush-left"
        key={key}
      >
        <h2 className="short-bottom">{label}</h2>
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
    const badgeCopy = isCertified
      ? i18nMark("Certified")
      : i18nMark("Community");
    const appearance = isCertified ? "primary" : "default";

    return (
      <span className="column-3">
        <Trans id={badgeCopy} render={<Badge appearance={appearance} />} />
      </span>
    );
  }

  renderCliHint() {
    return (
      <div>
        <Trans render="p">CLI Only Package</Trans>
        <Trans render="p">
          {"This package can only be installed using the CLI. See the "}
          <a
            href={MetadataStore.buildDocsURI(
              "/cli/command-reference/dcos-package/dcos-package-install/"
            )}
            target="_blank"
          >
            documentation
          </a>
          .
        </Trans>
      </div>
    );
  }

  renderInstallButton({ tooltipContent, disabled }) {
    const button = (
      <button
        className={classNames("button button-primary", { disabled })}
        onClick={() => disabled || this.handleReviewAndRunClick()}
      >
        <Trans render="span">Review & Run</Trans>
      </button>
    );
    return !tooltipContent ? (
      button
    ) : (
      <Tooltip
        wrapText={true}
        content={tooltipContent}
        suppress={!disabled}
        width={200}
      >
        {button}
      </Tooltip>
    );
  }

  hasUnresolvedDependency(cosmosPackage) {
    const dep = dependency(cosmosPackage);
    return dep && !(this.state.runningPackageNames.data || []).includes(dep);
  }

  renderReviewAndRunButton(cosmosPackage) {
    if (cosmosPackage.isCLIOnly()) {
      return this.renderCliHint();
    }

    if (this.state.isLoadingSelectedVersion) {
      return this.renderInstallButton({
        disabled: true,
        tooltipContent: <Trans>Loading selected version</Trans>
      });
    }

    if (this.hasUnresolvedDependency(cosmosPackage)) {
      return this.renderInstallButton({
        disabled: true,
        tooltipContent: (
          <Trans>Cannot run without {dependency(cosmosPackage)} package.</Trans>
        )
      });
    }

    if (
      MetadataStore.version &&
      cosmosPackage.minDcosReleaseVersion &&
      semver.compare(
        semver.coerce(MetadataStore.version),
        semver.coerce(cosmosPackage.minDcosReleaseVersion)
      ) < 0
    ) {
      return this.renderInstallButton({
        disabled: true,
        tooltipContent: (
          <Trans>
            This version of {cosmosPackage.getName()} requires DC/OS version{" "}
            {cosmosPackage.minDcosReleaseVersion} or higher, but you are running
            DC/OS version {semver.coerce(MetadataStore.version)}
          </Trans>
        )
      });
    }

    return this.renderInstallButton({ tooltipContent: "", disabled: false });
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
        buttonClassName="button button-primary-link dropdown-toggle flush-left flush-right"
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
                <Icon
                  shape={SystemIcons.CircleCheck}
                  size={iconSizeL}
                  color={green}
                />
              </span>
              <Trans render="h2" className="short-top short-bottom">
                Success!
              </Trans>
              <Trans
                render="div"
                className="install-package-modal-package-notes text-overflow-break-word"
              >
                {StringUtil.capitalize(name)} is being installed.
              </Trans>
            </div>
          </div>
          <div className="modal-footer">
            <div className="button-collection button-collection-stacked horizontal-center">
              <a
                className="button button-success button-block"
                href={`#/services/detail/${encodeURIComponent(
                  location.query.appId
                )}`}
              >
                <Trans render="span">Open Service</Trans>
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
        value: description && (
          <div
            dangerouslySetInnerHTML={StringUtil.parseMarkdown(description)}
          />
        )
      },
      {
        label: " ",
        value: preInstallNotes && (
          <InfoBoxInline
            appearance="warning"
            message={
              <div
                className="pre-install-notes"
                dangerouslySetInnerHTML={preInstallNotesParsed}
              />
            }
          />
        )
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

    const isLoading = this.state.runningPackageNames.state === "loading";

    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PackageDetailBreadcrumbs
              cosmosPackage={cosmosPackage}
              isLoading={state.isLoadingSelectedVersion}
            />
          }
        />

        {!isLoading ? (
          <div>
            <div className="container">
              {this.hasUnresolvedDependency(cosmosPackage) &&
                renderUnresolvedDependency(dependency(cosmosPackage))}

              <div className="media-object-spacing-wrapper media-object-spacing-wide media-object-offset">
                <div className="media-object media-object-align-top media-object-wrap">
                  <div className="media-object-item">
                    <div className="icon icon-huge icon-image-container icon-app-container icon-app-container--borderless icon-default-white">
                      <Image
                        fallbackSrc={defaultServiceImage}
                        src={
                          state.isLoadingSelectedVersion
                            ? defaultServiceImage
                            : cosmosPackage.getIcons()["icon-large"]
                        }
                      />
                    </div>
                  </div>
                  {!state.isLoadingSelectedVersion && (
                    <div className="media-object-item media-object-item-grow ">
                      <h1 className="short flush-top flush-bottom">{name}</h1>
                      <div className="flex flex-align-items-center">
                        <span className="package-version-label">
                          <Trans>Version</Trans>:
                        </span>
                        {this.getPackageVersionsDropdown()}
                      </div>
                      <div className="row">
                        {this.getPackageBadge(cosmosPackage)}
                      </div>
                    </div>
                  )}
                  <div className="media-object-item package-action-buttons">
                    {this.renderReviewAndRunButton(cosmosPackage)}
                  </div>
                </div>
              </div>
              {state.isLoadingSelectedVersion
                ? this.getLoadingScreen()
                : this.getPackageDescription(definition, cosmosPackage)}
            </div>
            {this.getInstalledSuccessModal(name)}
          </div>
        ) : (
          <Loader />
        )}
      </Page>
    );
  }
}

PackageDetailTab.contextTypes = {
  router: routerShape
};

const dependency = cosmosPackage => (cosmosPackage.manager || {}).packageName;

const renderUnresolvedDependency = dependency => (
  <div className="infoBoxWrapper">
    <InfoBoxInline
      message={
        <div>
          <Icon shape={SystemIcons.CircleInformation} size={iconSizeXs} />{" "}
          <Trans>
            This service cannot run without the {dependency} package. Please run{" "}
            <Link to={`/catalog/packages/${dependency}`}>
              {dependency} package
            </Link>{" "}
            to enable this service.
          </Trans>
        </div>
      }
    />
  </div>
);

module.exports = PackageDetailTab;
