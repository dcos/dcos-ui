import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';

import Breadcrumbs from './Breadcrumbs';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MarathonStore from '../stores/MarathonStore';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import ServiceDetailConfigurationTab from './ServiceDetailConfigurationTab';
import ServiceDetailDebugTab from './ServiceDetailDebugTab';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceDetailVolumesTab from './ServiceDetailVolumesTab';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceInfo from './ServiceInfo';
import ServiceScaleFormModal from './modals/ServiceScaleFormModal';
import {StoreMixin} from 'mesosphere-shared-reactjs';
import TabsMixin from '../mixins/TabsMixin';

const METHODS_TO_BIND = [
  'onActionsItemSelection',
  'onAcceptDestroyConfirmDialog',
  'onAcceptSuspendConfirmDialog',
  'closeDialog'
];

class ServiceDetail extends mixin(InternalStorageMixin, StoreMixin, TabsMixin) {

  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Tasks',
      configuration: 'Configuration',
      debug: 'Debug',
      volumes: 'Volumes'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      disabledDialog: null,
      serviceActionDialog: null,
      errorMsg: null
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: [
          'serviceDeleteError',
          'serviceDeleteSuccess',
          'serviceEditError',
          'serviceEditSuccess'
        ]
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onActionsItemSelection(item) {
    this.setState({serviceActionDialog: item.id});
  }

  onAcceptDestroyConfirmDialog() {
    this.setState({disabledDialog: ServiceActionItem.DESTROY}, () => {
      MarathonStore.deleteService(this.props.service.id);
    });
  }

  onAcceptSuspendConfirmDialog() {
    this.setState({disabledDialog: ServiceActionItem.SUSPEND}, () => {
      MarathonStore.editService({
        id: this.props.service.id,
        instances: 0
      });
    });
  }

  onMarathonStoreServiceDeleteSuccess() {
    this.closeDialog();
    this.context.router.transitionTo('services-page');
  }

  onMarathonStoreServiceDeleteError({message:errorMsg}) {
    this.setState({
      disabledDialog: null,
      errorMsg
    });
  }

  onMarathonStoreServiceEditSuccess() {
    this.closeDialog();
  }

  onMarathonStoreServiceEditError({message:errorMsg}) {
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

  getDestroyConfirmDialog() {
    const {service} = this.props;
    const {state} = this;

    let message = (
      <div className="container-pod flush-top container-pod-short-bottom">
        <h2 className="text-danger text-align-center flush-top">Destroy Service</h2>
        <p>Are you sure you want to destroy {service.getId()}? This action is irreversible.</p>
        {this.getErrorMessage()}
      </div>
    );

    return  (
      <Confirm children={message}
        disabled={state.disabledDialog === ServiceActionItem.DESTROY}
        open={state.serviceActionDialog === ServiceActionItem.DESTROY}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText="Destroy Service"
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.onAcceptDestroyConfirmDialog} />
    );
  }

  getSuspendConfirmDialog() {
    const {service} = this.props;
    const {state} = this;

    let message = (
      <div className="container-pod flush-top container-pod-short-bottom">
        <h2 className="text-align-center flush-top">Suspend Service</h2>
        <p>Are you sure you want to suspend {service.getId()} by scaling to 0 instances?</p>
        {this.getErrorMessage()}
      </div>
    );

    return  (
      <Confirm children={message}
        disabled={state.disabledDialog === ServiceActionItem.SUSPEND}
        open={state.serviceActionDialog === ServiceActionItem.SUSPEND}
        onClose={this.closeDialog}
        leftButtonText="Cancel"
        leftButtonCallback={this.closeDialog}
        rightButtonText="Suspend Service"
        rightButtonClassName="button button-primary"
        rightButtonCallback={this.onAcceptSuspendConfirmDialog} />
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

  getErrorMessage() {
    let {errorMsg} = this.state;
    if (!errorMsg) {
      return null;
    }
    return (
      <p className="text-danger flush-top">{errorMsg}</p>
    );
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
      <ServiceDetailVolumesTab service={this.props.service}/>
    );
  }

  renderTasksTabView() {
    return (
      <ServiceDetailTaskTab service={this.props.service} />
    );
  }

  render() {
    const {service} = this.props;

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
          open={this.state.serviceActionDialog === ServiceActionItem.EDIT}
          service={service}
          onClose={this.closeDialog} />
        {this.getDestroyConfirmDialog()}
        {this.getServiceScaleFormModal()}
        {this.getSuspendConfirmDialog()}
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
