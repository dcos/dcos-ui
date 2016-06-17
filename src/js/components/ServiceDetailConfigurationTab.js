import {Dropdown} from 'reactjs-components';
import React from 'react';

import ConfigurationView from './ConfigurationView';
import DCOSStore from '../stores/DCOSStore';
import MarathonStore from '../stores/MarathonStore';
import Service from '../structs/Service';
import ServiceUtil from '../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleApplyButtonClick',
  'handleEditButtonClick',
  'handleVersionSelection'
];

class ServiceDetailConfigurationTab extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedVersionID: null
    };

    METHODS_TO_BIND.forEach(method => {
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
    let serviceConfiguration =
      this.props.service.getVersions().get(this.state.selectedVersionID);

    MarathonStore.editService(
      ServiceUtil.getAppDefinitionFromService(
        new Service(serviceConfiguration)
      )
    );
  }

  handleEditButtonClick() {

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
    )
  }

  getRollbackButtons() {
    let {service} = this.props;
    let {selectedVersionID} = this.state;

    if (service.getVersion() === selectedVersionID) {
      return null;
    }

    return [(
      <button className="button button-stroke button-inverse"
        key="version-button-edit"
        onClick={() => this.handleEditButtonClick()}>
        Edit
      </button>
    ), (
      <button className="button button-stroke button-inverse"
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
          <span className="text-overflow" title={itemCaption}>
            {itemCaption}
          </span>
        )
      });
    }

    return (
      <Dropdown
        buttonClassName="button button-inverse dropdown-toggle button-split-content"
        dropdownMenuClassName="dropdown-menu inverse"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        items={versionItems}
        key="version-dropdown"
        onItemSelection={this.handleVersionSelection}
        persistentID={this.state.selectedVersionID}
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown" />
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
      <div>
        {this.getVersionsActions()}
        <ConfigurationView
          headline={headline}
          service={service}
          versionID={selectedVersionID} />
      </div>
    );
  }

}

ServiceDetailConfigurationTab.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceDetailConfigurationTab;
