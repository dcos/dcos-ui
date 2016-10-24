import {DCOSStore} from 'foundation-ui';
import {Dropdown} from 'reactjs-components';
import React from 'react';

import ServiceSpecView from './ServiceSpecView';
import MarathonStore from '../stores/MarathonStore';
import Service from '../structs/Service';
import ApplicationSpec from '../structs/ApplicationSpec';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceUtil from '../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleApplyButtonClick',
  'handleEditButtonClick',
  'handleCloseServiceFormModal',
  'handleVersionSelection'
];

class ServiceDetailConfigurationTab extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedVersionID: null,
      serviceToEdit: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let {service} = this.props;

    this.setState({
      selectedVersionID: service.getVersion()
    });
    DCOSStore.fetchServiceVersions(service.getId());
  }

  componentWillReceiveProps({service:nextService}) {
    let {service} = this.props;

    if (service.getVersion() === nextService.getVersion()) {
      return;
    }

    this.setState({
      selectedVersionID: nextService.getVersion()
    });
    DCOSStore.fetchServiceVersions(service.getId());
  }

  handleApplyButtonClick() {
    let {service} = this.props;

    let serviceConfiguration =
        service.getVersions().get(this.state.selectedVersionID);

    MarathonStore.editService(service,
      ServiceUtil.getAppDefinitionFromService(
          new ApplicationSpec(serviceConfiguration)
      )
    );
  }

  handleEditButtonClick() {
    let serviceConfiguration =
      this.props.service.getVersions().get(this.state.selectedVersionID);

    this.setState({
      serviceToEdit: ServiceUtil.createServiceFromResponse(serviceConfiguration)
    });
  }

  handleCloseServiceFormModal() {
    this.setState({
      serviceToEdit: null
    });
  }

  handleVersionSelection(versionItem) {
    this.setState({
      selectedVersionID: versionItem.id
    });
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
        itemCaption = `Current Version - ${localeVersion}`;
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
        buttonClassName="button dropdown-toggle button-split-content"
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

  getServiceFormModal() {
    let {serviceToEdit} = this.state;

    if (serviceToEdit == null) {
      return null;
    }

    return (
      <ServiceFormModal
        isEdit={true}
        open={true}
        service={serviceToEdit}
        onClose={this.handleCloseServiceFormModal} />
    );
  }

  render() {
    let {service} = this.props;
    let {selectedVersionID} = this.state;

    let localeVersion = new Date(selectedVersionID).toLocaleString();
    let headline = `Current Version (${localeVersion})`;

    if (service.getVersion() !== selectedVersionID) {
      headline = `Previous Version (${localeVersion})`;
    }

    return (
      <div className="tab">
        {this.getVersionsActions()}
        <ServiceSpecView
          headline={headline}
          service={service}
          versionID={selectedVersionID} />
        {this.getServiceFormModal()}
      </div>
    );
  }

}

ServiceDetailConfigurationTab.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceDetailConfigurationTab;
