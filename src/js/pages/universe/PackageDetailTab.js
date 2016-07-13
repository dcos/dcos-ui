import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import ImageViewer from '../../components/ImageViewer';
import InstallPackageModal from '../../components/modals/InstallPackageModal';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import StringUtil from '../../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleInstallModalClose',
  'handleInstallModalOpen'
];

class PackageDetailTab extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      hasError: 0,
      openInstallModal: false,
      isLoading: true
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: ['descriptionError', 'descriptionSuccess'],
      unmountWhen: function (store, event) {
        if (event === 'descriptionSuccess') {
          return !!CosmosPackagesStore.get('packageDetails');
        }
      },
      listenAlways: false
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    let {packageName, packageVersion} = this.props.params;
    // Fetch package description
    CosmosPackagesStore.fetchPackageDescription(packageName, packageVersion);
  }

  onCosmosPackagesStoreDescriptionError() {
    this.setState({hasError: true});
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    this.setState({hasError: false, isLoading: false});
  }

  handleInstallModalClose() {
    this.setState({openInstallModal: false});
  }

  handleInstallModalOpen() {
    this.setState({openInstallModal: true});
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getItems(definition, renderItem) {
    let items = [];
    definition.forEach((item, index) => {
      let {label, type, value} = item;

      // When there is no content to render, discard it all together
      if (!value || (Array.isArray(value) && !value.length)) {
        return null;
      }

      // If not specific type assume value is renderable
      let content = value;

      // Render sub items
      if (type === 'subItems') {
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

    if (typeof value === 'string') {
      value = <p className="flush">{value}</p>;
    }

    return (
      <div
        className="container-pod container-pod-super-short-bottom flush-top"
        key={key}>
        <h5 className="inverse flush-top">{label}</h5>
        {value}
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
      </div>
    );
  }

  getSubItem(label, value, key) {
    let content = value;

    if (StringUtil.isEmail(value)) {
      content = <a key={key} href={`mailto:${value}`}>{value}</a>;
    }

    if (StringUtil.isUrl(value)) {
      content = <a key={key} href={value} target="_blank">{value}</a>;
    }

    return (
      <p key={key} className="short">{`${label}: `}{content}</p>
    );
  }

  mapLicenses(licenses) {
    return licenses.map(function (license) {
      let item = {
        label: license.name,
        value: license.url
      };

      return item;
    });
  }

  getSelectedBadge(cosmosPackage, version) {
    let versionTag = (
      <span>{version}</span>
    );

    if (cosmosPackage.isSelected()) {
      return (
        <span className="badge-container badge-primary selected-badge">
          <span className="badge flush">
            Selected
          </span>
          {versionTag}
        </span>
      );
    }

    return versionTag;
  }

  render() {
    let {props, state} = this;

    if (state.hasError || !props.params.packageName) {
      return this.getErrorScreen();
    }

    let cosmosPackage = CosmosPackagesStore.getPackageDetails();
    if (state.isLoading || !cosmosPackage) {
      return this.getLoadingScreen();
    }

    let name = cosmosPackage.getName();
    let version = cosmosPackage.getCurrentVersion();
    let description = cosmosPackage.getDescription();
    let preInstallNotes = cosmosPackage.getPreInstallNotes();

    let definition = [
      {
        label: 'Description',
        value: description && <div dangerouslySetInnerHTML={StringUtil.parseMarkdown(description)} />
      },
      {
        label: 'Pre-Install Notes',
        value: preInstallNotes && <div dangerouslySetInnerHTML={StringUtil.parseMarkdown(preInstallNotes)} />
      },
      {
        label: 'Information',
        type: 'subItems',
        value: [
          {label: 'SCM', value: cosmosPackage.getSCM()},
          {label: 'Maintainer', value: cosmosPackage.getMaintainer()}
        ]
      },
      {
        label: 'Licenses',
        type: 'subItems',
        value: this.mapLicenses(cosmosPackage.getLicenses())
      }
    ];

    return (
      <div>
        <Breadcrumbs />
        <div className="container-pod container-pod-divider-bottom container-pod-divider-inverse flush-top flush-bottom">
          <div className="media-object-spacing-wrapper">
            <div className="media-object media-object-align-middle">
              <div className="media-object-item">
                <div className="icon icon-huge icon-image-container icon-app-container icon-default-white">
                  <img src={cosmosPackage.getIcons()['icon-large']} />
                </div>
              </div>
              <div className="media-object-item">
                <h1 className="inverse flush">
                  {name}
                </h1>
                <p>{this.getSelectedBadge(cosmosPackage, version)}</p>
                <button
                  className="button button-success"
                  onClick={this.handleInstallModalOpen}>
                  Install Package
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container-pod container-pod-short">
          {this.getItems(definition, this.getItem)}
          <ImageViewer images={cosmosPackage.getScreenshots()} />
        </div>
        <InstallPackageModal
          open={state.openInstallModal}
          packageName={name}
          packageVersion={version}
          onClose={this.handleInstallModalClose}/>
      </div>
    );
  }
}

module.exports = PackageDetailTab;
