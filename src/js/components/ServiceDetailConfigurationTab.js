import {Dropdown} from 'reactjs-components';
import React from 'react';

import ConfigurationView from './ConfigurationView';
import DCOSStore from '../stores/DCOSStore';
import Service from '../structs/Service';

const METHODS_TO_BIND = [
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
    this.setState({
      selectedVersionID: this.props.service.getVersion()
    });
    DCOSStore.fetchServiceVersions(this.props.service.getId());
  }

  handleVersionSelection(versionItem) {
    this.setState({
      selectedVersionID: versionItem.id
    });
  }

  getVersionsDropdown() {
    let {service} = this.props;
    let versions = service.getVersions();

    if (versions.size < 2) {
      return null;
    }

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
        {this.getVersionsDropdown()}
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
