import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from './Breadcrumbs';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MarathonStore from '../stores/MarathonStore';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import ServiceDestroyModal from './modals/ServiceDestroyModal';
import ServiceDetailConfigurationTab from './ServiceDetailConfigurationTab';
import ServiceDetailDebugTab from './ServiceDetailDebugTab';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceSuspendModal from './modals/ServiceSuspendModal';
import ServiceInfo from './ServiceInfo';
import ServiceScaleFormModal from './modals/ServiceScaleFormModal';
import TabsMixin from '../mixins/TabsMixin';
import VolumeTable from './VolumeTable';

const METHODS_TO_BIND = [
  'closeDialog',
  'onActionsItemSelection',
  'onAcceptRestartConfirmDialog',
  'onServiceDestroyModalClose',
  'onServiceSuspendModalClose'
];

class ServiceDetail extends mixin(InternalStorageMixin, StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Tasks',
      configuration: 'Configuration',
      debug: 'Debug'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      disabledDialog: null,
      errorMsg: null,
      serviceActionDialog: null
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceRestartError',
          'serviceRestartSuccess'
        ]
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.checkForVolumes();
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);
    this.checkForVolumes();
  }

  onActionsItemSelection(item) {
    this.setState({serviceActionDialog: item.id});
  }

  onAcceptRestartConfirmDialog() {
    this.setState({disabledDialog: ServiceActionItem.RESTART}, () => {
      MarathonStore.restartService(
        this.props.service.id, this.shouldForceUpdate(this.state.errorMsg)
      );
    });
  }

  onServiceDestroyModalClose() {
    this.closeDialog();
    this.context.router.transitionTo('services-page');
  }

  onServiceSuspendModalClose() {
    this.closeDialog();
  }

  onMarathonStoreServiceRestartSuccess() {
    this.closeDialog();
  }

  onMarathonStoreServiceRestartError({message:errorMsg}) {
    this.setState({
      disabledDialog: null,
      errorMsg
    });
  }

  closeDialog() {
    this.setState({
      disabledDialog: null,
      errorMsg: null,
      serviceActionDialog: null
    });
  }

  getRestartConfirmDialog() {
    const {service} = this.props;
    const {state} = this;

    return (
      <Confirm
        disabled={state.disabledDialog === ServiceActionItem.RESTART}
        open={state.serviceActionDialog === ServiceActionItem.RESTART}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText="Restart Service"
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.onAcceptRestartConfirmDialog}>
        <div className="container-pod flush-top container-pod-short-bottom">
          <h2 className="text-danger text-align-center flush-top">Restart Service</h2>
          <p>
            Are you sure you want to restart <span className="emphasize">{service.getId()}</span>?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
    );
  }

  getServiceScaleFormModal() {
    return (
      <ServiceScaleFormModal
        open={this.state.serviceActionDialog === ServiceActionItem.SCALE}
        service={this.props.service}
        onClose={this.closeDialog} />
    );
  }

  shouldForceUpdate(message = this.state.errorMsg) {
    return message && /force=true/.test(message);
  }

  getErrorMessage() {
    let {errorMsg} = this.state;
    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate(errorMsg)) {
      return (
        <h4 className="text-align-center text-danger flush-top">
          App is currently locked by one or more deployments. Press the button
          again to forcefully change and deploy the new configuration.
        </h4>
      );
    }

    return (
      <p className="text-danger flush-top">{errorMsg}</p>
    );
  }

  checkForVolumes() {
    // Add the Volumes tab if it isn't already there and the service has
    // at least one volume.
    if (this.tabs_tabs.volumes == null && !!this.props.service
      && this.props.service.getVolumes().getItems().length > 0) {
      this.tabs_tabs.volumes = 'Volumes';
      this.forceUpdate();
    }
  }

  renderConfigurationTabView() {
    return (
      <ServiceDetailConfigurationTab service={this.props.service} />
    );
  }

  renderDebugTabView() {
    return (
      <ServiceDetailDebugTab service={this.props.service}/>
    );
  }

  renderVolumesTabView() {
    return (
      <VolumeTable
        params={this.context.router.getCurrentParams()}
        service={this.props.service}
        volumes={this.props.service.getVolumes().getItems()} />
    );
  }

  renderTasksTabView() {
    return (
      <ServiceDetailTaskTab service={this.props.service} />
    );
  }

  render() {
    const {service} = this.props;
    let {serviceActionDialog} = this.state;

    return (
      <div className="flex-container-col">
        <div className="container-pod
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow">
          <Breadcrumbs />
          <ServiceInfo onActionsItemSelection={this.onActionsItemSelection}
            service={service} tabs={this.tabs_getUnroutedTabs()} />
          {this.tabs_getTabView()}
        </div>
        <ServiceFormModal isEdit={true}
          open={serviceActionDialog === ServiceActionItem.EDIT}
          service={service}
          onClose={this.closeDialog} />
        <ServiceDestroyModal
          onClose={this.onServiceDestroyModalClose}
          open={serviceActionDialog === ServiceActionItem.DESTROY}
          service={service} />
        {this.getRestartConfirmDialog()}
        {this.getServiceScaleFormModal()}
        <ServiceSuspendModal
          onClose={this.onServiceSuspendModalClose}
          open={serviceActionDialog === ServiceActionItem.SUSPEND}
          service={service} />
      </div>

    );
  }
}

ServiceDetail.contextTypes = {
  router: React.PropTypes.func
};

ServiceDetail.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDetail;
