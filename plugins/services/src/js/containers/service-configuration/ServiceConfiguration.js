import {DCOSStore} from 'foundation-ui';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ApplicationSpec from '../../structs/ApplicationSpec';
import Icon from '../../../../../../src/js/components/Icon';
import Loader from '../../../../../../src/js/components/Loader';
import ServiceConfigDisplay from '../../service-configuration/ServiceConfigDisplay';
import Service from '../../structs/Service';
import ServiceUtil from '../../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleApplyButtonClick',
  'handleEditButtonClick',
  'handleVersionSelection'
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

    this.store_listeners = [{name: 'dcos', events: ['change']}];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    const {service} = this.props;
    const versionID = service.getVersion();

    this.setState({selectedVersionID: versionID});

    fetchVersion(service, versionID);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {service} = this.props;
    const {selectedVersionID} = this.state;

    return nextProps.service.getVersion() !== service.getVersion()
      || nextProps.service.getVersions() !== service.getVersions()
      || nextState.selectedVersionID !== selectedVersionID;
  }

  handleApplyButtonClick() {
    const {editService, service} = this.props;
    const {selectedVersionID} = this.state;

    const serviceConfiguration = service.getVersions().get(selectedVersionID);

    editService(service,
      ServiceUtil.getDefinitionFromSpec(
          new ApplicationSpec(serviceConfiguration)
      )
    );
  }

  handleEditButtonClick() {
    const serviceConfiguration =
      this.props.service.getVersions().get(this.state.selectedVersionID);

    const service = ServiceUtil.createServiceFromResponse(serviceConfiguration);

    this.context.modalHandlers.editService({service});
  }

  handleVersionSelection(versionItem) {
    fetchVersion(this.props.service, versionItem.id);

    this.setState({selectedVersionID: versionItem.id});
  }

  getVersionsActions() {
    const versions = this.props.service.getVersions();

    if (versions.size < 2) {
      return null;
    }

    return (
      <div className="button-collection">
        {this.getVersionsDropdown()}
        {this.getRollbackButtons()}
      </div>
    );
  }

  getRollbackButtons() {
    const {service} = this.props;
    const {selectedVersionID} = this.state;

    if (service.getVersion() === selectedVersionID) {
      return null;
    }

    return [(
      <button className="button button-stroke"
        key="version-button-edit"
        onClick={() => this.handleEditButtonClick()}>
        Edit
      </button>
    ), (
      <button className="button button-stroke"
        key="version-button-apply"
        onClick={() => this.handleApplyButtonClick()}>
        Apply
      </button>
    )];
  }

  getVersionsDropdown() {
    const {service} = this.props;
    const versions = service.getVersions();

    let versionItems = [];
    for (const version of versions.keys()) {
      let localeVersion = new Date(version).toLocaleString();
      let itemCaption = localeVersion;
      if (version === service.getVersion()) {
        itemCaption = (
          <span className="badge-container">
            <span className="badge-container-text">{localeVersion}</span>
            <span className="badge">Active</span>
          </span>
        );
      }

      versionItems.push({
        id: version,
        html: (
          <div className="button-split-content-wrapper">
            <Icon className="services-version-select-icon services-version-select-icon-selected button-split-content-item"
              id="check"
              size="mini"
              color="neutral" />
            <Icon className="services-version-select-icon button-split-content-item"
              id="commit"
              size="mini"
              color="neutral" />
            <span className="button-split-content-item text-overflow"
              title={itemCaption}>
              {itemCaption}
            </span>
          </div>
        )
      });
    }

    return (
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
        wrapperClassName="services-version-select dropdown" />
    );
  }

  render() {
    const {service} = this.props;
    const {selectedVersionID} = this.state;
    const config = service.getVersions().get(selectedVersionID);
    let content = null;

    if (config == null) {
      content = <Loader />;
    } else {
      content = <ServiceConfigDisplay appConfig={config} />;
    }

    return (
      <div className="container">
        <div className="pod flush-top flush-right flush-left">
          {this.getVersionsActions()}
        </div>
        {content}
      </div>
    );
  }

}

ServiceConfiguration.contextTypes = {
  modalHandlers: React.PropTypes.shape({
    editService: React.PropTypes.func.isRequired
  }).isRequired
};

ServiceConfiguration.propTypes = {
  editService: React.PropTypes.func.isRequired,
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceConfiguration;
