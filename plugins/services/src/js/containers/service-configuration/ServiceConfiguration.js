import {DCOSStore} from 'foundation-ui';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ApplicationSpec from '../../structs/ApplicationSpec';
import Loader from '../../../../../../src/js/components/Loader';
import ServiceConfigDisplay from '../../components/ServiceConfigDisplay';
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
    let {editService, service} = this.props;
    let {selectedVersionID} = this.state;

    let serviceConfiguration = service.getVersions().get(selectedVersionID);

    editService(service,
      ServiceUtil.getDefinitionFromSpec(
          new ApplicationSpec(serviceConfiguration)
      )
    );
  }

  handleEditButtonClick() {
    let serviceConfiguration =
      this.props.service.getVersions().get(this.state.selectedVersionID);

    const service = ServiceUtil.createServiceFromResponse(serviceConfiguration);

    this.context.modalHandlers.editService({service});
  }

  handleVersionSelection(versionItem) {
    fetchVersion(this.props.service, versionItem.id);

    this.setState({selectedVersionID: versionItem.id});
  }

  getVersionsActions() {
    let versions = this.props.service.getVersions();

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
    let {service} = this.props;
    let {selectedVersionID} = this.state;

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
    let {service} = this.props;
    let versions = service.getVersions();

    let versionItems = [];
    for (let version of versions.keys()) {
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
        buttonClassName="button dropdown-toggle button-transparent button-split-content"
        dropdownMenuClassName="dropdown-menu"
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
        wrapperClassName="dropdown" />
     );
  }

  render() {
    const {service} = this.props;
    const {selectedVersionID} = this.state;
    const config = service.getVersions().get(selectedVersionID);
    let content = null;

    const localeVersion = new Date(selectedVersionID).toLocaleString();
    let headline = `Current Version (${localeVersion})`;

    if (service.getVersion() !== selectedVersionID) {
      headline = `Previous Version (${localeVersion})`;
    }

    if (config == null) {
      content = <Loader />;
    } else {
      content = <ServiceConfigDisplay appConfig={config} />;
    }

    return (
      <div className="flex-item-grow-1">
        <div className="container">
          {this.getVersionsActions()}
          <h4 className="flush-top" title={selectedVersionID}>{headline}</h4>
          {content}
        </div>
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
