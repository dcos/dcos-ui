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
import PodDetailInstancesTab from './PodDetailInstancesTab';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceSuspendModal from './modals/ServiceSuspendModal';
import PodInfo from './PodInfo';
import TabsMixin from '../mixins/TabsMixin';
import VolumeTable from './VolumeTable';

const METHODS_TO_BIND = [
  'closeDialog',
  'onActionsItemSelection',
  'onAcceptRestartConfirmDialog',
  'onServiceDestroyModalClose',
  'onServiceSuspendModalClose'
];

class PodDetail extends mixin(InternalStorageMixin, StoreMixin, TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      instances: 'Instances',
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

  componentWillMount() {
    if (this.props.mode === 'pod') {

    }
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);
  }

  onActionsItemSelection(item) {
    this.setState({serviceActionDialog: item.id});
  }

  onAcceptRestartConfirmDialog() {
    this.setState({disabledDialog: ServiceActionItem.RESTART}, () => {
      MarathonStore.restartService(
        this.props.pod.id, this.shouldForceUpdate(this.state.errorMsg)
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
    const {pod} = this.props;
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
            Are you sure you want to restart <span className="emphasize">{pod.getId()}</span>?
          </p>
          {this.getErrorMessage()}
        </div>
      </Confirm>
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

  renderConfigurationTabView() {
    return (
      <ServiceDetailConfigurationTab service={this.props.pod} />
    );
  }

  renderDebugTabView() {
    return (
      <ServiceDetailDebugTab service={this.props.pod}/>
    );
  }

  renderVolumesTabView() {
    return (
      <VolumeTable
        params={this.context.router.getCurrentParams()}
        service={this.props.pod}
        volumes={this.props.pod.getVolumes().getItems()} />
    );
  }

  renderInstancesTabView() {
    return (
      <PodDetailInstancesTab pod={this.props.pod} />
    );
  }

  render() {
    const {pod} = this.props;
    let {serviceActionDialog} = this.state;

    return (
      <div className="flex-container-col">
        <div className="container-pod
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow">
          <Breadcrumbs />
          <PodInfo onActionsItemSelection={this.onActionsItemSelection}
            pod={pod} tabs={this.tabs_getUnroutedTabs()} />
          {this.tabs_getTabView()}
        </div>
        <ServiceFormModal isEdit={true}
          open={serviceActionDialog === ServiceActionItem.EDIT}
          service={pod}
          onClose={this.closeDialog} />
        <ServiceDestroyModal
          onClose={this.onServiceDestroyModalClose}
          open={serviceActionDialog === ServiceActionItem.DESTROY}
          service={pod} />
        {this.getRestartConfirmDialog()}
        <ServiceSuspendModal
          onClose={this.onServiceSuspendModalClose}
          open={serviceActionDialog === ServiceActionItem.SUSPEND}
          service={pod} />
      </div>

    );
  }
}

PodDetail.contextTypes = {
  router: React.PropTypes.func
};

PodDetail.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = PodDetail;
