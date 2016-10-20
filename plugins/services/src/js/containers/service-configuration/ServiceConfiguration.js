import {Dropdown} from 'reactjs-components';
import React from 'react';

import ServiceSpecView from './ServiceSpecView';
import Service from '../../structs/Service';
import ApplicationSpec from '../../structs/ApplicationSpec';
import ServiceUtil from '../../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleApplyButtonClick',
  'handleEditButtonClick',
  'handleVersionSelection'
];

class ServiceConfiguration extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      selectedVersionID: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      selectedVersionID: this.props.service.getVersion()
    });
  }

  componentWillReceiveProps({service:nextService}) {
    if (nextService.getVersion() === this.props.service.getVersion()) {
      return;
    }

    this.setState({
      selectedVersionID: nextService.getVersion()
    });
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
