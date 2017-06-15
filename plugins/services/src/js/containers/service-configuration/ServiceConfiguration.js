import { DCOSStore } from "foundation-ui";
import { Dropdown, Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import ApplicationSpec from "../../structs/ApplicationSpec";
import Icon from "../../../../../../src/js/components/Icon";
import Loader from "../../../../../../src/js/components/Loader";
import ServiceConfigDisplay
  from "../../service-configuration/ServiceConfigDisplay";
import Service from "../../structs/Service";
import { getDefinitionFromSpec } from "../../utils/ServiceUtil";

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
      `/services/overview/${serviceID}/edit/${selectedVersionID}`
    );
  }

  handleVersionSelection(versionItem) {
    fetchVersion(this.props.service, versionItem.id);

    this.setState({ selectedVersionID: versionItem.id });
  }

  getVersionsActions() {
    const versions = this.props.service.getVersions();

    if (versions.size < 2) {
      return null;
    }

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

    if (service.getVersion() === selectedVersionID) {
      return null;
    }

    return [
      <button
        className="button button-stroke"
        key="version-button-edit"
        onClick={() => this.handleEditButtonClick()}
      >
        Edit
      </button>,
      <button
        className="button button-stroke"
        key="version-button-apply"
        onClick={() => this.handleApplyButtonClick()}
      >
        Apply
      </button>
    ];
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
            <span className="badge-container">
              <span className="badge-container-text">{localeVersion}</span>
              <span className="badge">Active</span>
            </span>
          );
        }

        return {
          id: version,
          html: (
            <div className="button-split-content-wrapper">
              <Icon
                className="services-version-select-icon services-version-select-icon-selected button-split-content-item"
                id="check"
                size="mini"
                color="neutral"
              />
              <Icon
                className="services-version-select-icon button-split-content-item"
                id="commit"
                size="mini"
                color="neutral"
              />
              <span
                className="button-split-content-item text-overflow"
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
    let content = null;

    if (config == null) {
      content = <Loader />;
    } else {
      content = <ServiceConfigDisplay appConfig={config} errors={errors} />;
    }

    return (
      <div className="container">
        {this.getVersionsActions()}
        {content}
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
  onEditClick: React.PropTypes.func.isRequired,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfiguration;
