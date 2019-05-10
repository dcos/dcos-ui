import { Dropdown, Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Trans, DateFormat } from "@lingui/macro";
import { Badge, Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import Loader from "#SRC/js/components/Loader";
import {
  isSDKService,
  getDefinitionFromSpec
} from "#PLUGINS/services/src/js/utils/ServiceUtil";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import DateUtil from "#SRC/js/utils/DateUtil";

import ApplicationSpec from "../../structs/ApplicationSpec";
import ServiceConfigDisplay from "../../service-configuration/ServiceConfigDisplay";
import Service from "../../structs/Service";

const METHODS_TO_BIND = [
  "handleApplyButtonClick",
  "handleEditButtonClick",
  "handleVersionSelection"
];

function fetchVersion(service, versionID) {
  if (service.getVersions().get(versionID) == null) {
    DCOSStore.fetchServiceVersion(service.getId(), versionID);
  }
}

class ServiceConfiguration extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      selectedVersionID: null
    };

    this.store_listeners = [{ name: "dcos", events: ["change"] }];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    const { service } = this.props;
    const versionID = service.getVersion();

    this.setState({ selectedVersionID: versionID });

    fetchVersion(service, versionID);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { service } = this.props;
    const { selectedVersionID } = this.state;

    return (
      nextProps.service.getVersion() !== service.getVersion() ||
      nextProps.service.getVersions() !== service.getVersions() ||
      nextState.selectedVersionID !== selectedVersionID
    );
  }

  handleApplyButtonClick() {
    const { onEditClick, service } = this.props;
    const { selectedVersionID } = this.state;

    const serviceConfiguration = service.getVersions().get(selectedVersionID);

    onEditClick(
      service,
      getDefinitionFromSpec(new ApplicationSpec(serviceConfiguration))
    );
  }

  handleEditButtonClick() {
    const serviceID = encodeURIComponent(this.props.service.getId());
    const { selectedVersionID } = this.state;

    this.context.router.push(
      `/services/detail/${serviceID}/edit/${selectedVersionID}`
    );
  }

  handleVersionSelection(versionItem) {
    fetchVersion(this.props.service, versionItem.id);

    this.setState({ selectedVersionID: versionItem.id });
  }

  getVersionsActions() {
    return (
      <div className="pod flush-top flush-right flush-left">
        <div className="button-collection">
          {this.getVersionsDropdown()}
          {this.getRollbackButtons()}
        </div>
      </div>
    );
  }

  getRollbackButtons() {
    const { service } = this.props;
    const { selectedVersionID } = this.state;
    let applyButton = null;

    if (service.getVersion() !== selectedVersionID) {
      applyButton = (
        <button
          className="button button-primary-link"
          disabled={isSDKService(service)}
          key="version-button-apply"
          onClick={() => this.handleApplyButtonClick()}
        >
          Apply
        </button>
      );
    }

    return [applyButton];
  }

  getVersionsDropdown() {
    const { service } = this.props;
    const versions = service.getVersions();

    const versionItems = Array.from(versions.keys())
      .sort((a, b) => {
        return new Date(a) - new Date(b);
      })
      .map(version => {
        const localeVersion = new Date(version).toLocaleString();
        let itemCaption = localeVersion;
        if (version === service.getVersion()) {
          itemCaption = (
            <span className="badge-container flex">
              <span className="badge-container-text services-version-text text-overflow">
                <DateFormat
                  value={version}
                  format={DateUtil.getFormatOptions()}
                />
              </span>
              <Trans render={<Badge />}>Active</Trans>
            </span>
          );
        }

        return {
          id: version,
          html: (
            <div className="service-version-dropdown-wrapper button-split-content-wrapper flex">
              <span className="services-version-select-icon services-version-select-icon-selected button-split-content-item flex-item-shrink-0">
                <Icon
                  shape={SystemIcons.Check}
                  size={iconSizeXs}
                  color={greyDark}
                />
              </span>
              <span className="services-version-select-icon button-split-content-item flex-item-shrink-0">
                <Icon
                  shape={SystemIcons.Commit}
                  size={iconSizeXs}
                  color={greyDark}
                />
              </span>
              <span
                className="button-split-content-item flex-item-grow-1 text-overflow"
                title={version}
              >
                {itemCaption}
              </span>
            </div>
          )
        };
      });

    return (
      <Tooltip
        content="Configuration version"
        wrapperClassName="button button-transparent button-flush"
      >
        <Dropdown
          buttonClassName="services-version-select-toggle dropdown-toggle button button-transparent button-split-content flush-left"
          dropdownMenuClassName="services-version-select-menu dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          items={versionItems}
          key="version-dropdown"
          onItemSelection={this.handleVersionSelection}
          persistentID={this.state.selectedVersionID}
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="services-version-select dropdown"
        />
      </Tooltip>
    );
  }

  render() {
    const { errors, service } = this.props;
    const { selectedVersionID } = this.state;
    const config = service.getVersions().get(selectedVersionID);

    if (config == null) {
      return (
        <div className="container">
          <Loader />
        </div>
      );
    }

    const fileName = "config.json";
    const configString = JSON.stringify(config, null, 2) + "\n";

    return (
      <div className="container">
        <div className="row">
          <div className="column-6">{this.getVersionsActions()}</div>
          <div className="column-6 text-align-right">
            <button
              className="button button-primary-link button-inline-flex"
              onClick={this.handleEditButtonClick}
            >
              <Icon
                shape={SystemIcons.Pencil}
                size={iconSizeXs}
                color="currentColor"
              />
              <Trans render="span">Edit Config</Trans>
            </button>
            <a
              className="button button-primary-link flush-right"
              download={fileName}
              onClick={RouterUtil.triggerIEDownload.bind(
                null,
                fileName,
                configString
              )}
              href={RouterUtil.getResourceDownloadPath(
                "attachment/json",
                fileName,
                configString
              )}
            >
              <Icon
                shape={SystemIcons.Download}
                size={iconSizeXs}
                color="currentColor"
              />
              <Trans render="span">Download Config</Trans>
            </a>
          </div>
        </div>
        <ServiceConfigDisplay appConfig={config} errors={errors} />
      </div>
    );
  }
}

ServiceConfiguration.contextTypes = {
  router: routerShape
};

ServiceConfiguration.defaultProps = {
  errors: []
};

ServiceConfiguration.propTypes = {
  onEditClick: PropTypes.func.isRequired,
  errors: PropTypes.array,
  service: PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfiguration;
