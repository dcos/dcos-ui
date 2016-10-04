import mixin from 'reactjs-mixin';
import React from 'react';

import Breadcrumbs from './Breadcrumbs';
import Pod from '../structs/Pod';
import PodActionItem from '../constants/PodActionItem';
import PodConfigurationTabView from './PodConfigurationTabView';
import PodDebugTabView from './PodDebugTabView';
import PodHeader from './PodHeader';
import PodInstancesTabView from './PodInstancesTabView';
import ServiceDestroyModal from './modals/ServiceDestroyModal';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceScaleFormModal from './modals/ServiceScaleFormModal';
import ServiceSuspendModal from './modals/ServiceSuspendModal';
import TabsMixin from '../mixins/TabsMixin';

const METHODS_TO_BIND = [
  'handleAction',
  'handleCloseDialog'
];

class PodDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      instances: 'Instances',
      configuration: 'Configuration',
      debug: 'Debug'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      activeActionDialog: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleAction(action) {
    switch (action.id) {
      case PodActionItem.DESTROY:
      case PodActionItem.EDIT:
      case PodActionItem.SCALE:
      case PodActionItem.SUSPEND:

        this.setState({
          activeActionDialog: action.id
        });
        break;

      default:
        if (process.env.NODE_ENV !== 'production') {
          throw new TypeError('Trying to handle an unknown action:', action.id);
        }

    }
  }

  handleCloseDialog() {
    this.setState({
      activeActionDialog: null
    });
  }

  renderConfigurationTabView() {
    let {pod} = this.props;

    return (
      <PodConfigurationTabView pod={pod} />
    );
  }

  renderDebugTabView() {
    let {pod} = this.props;

    return (<PodDebugTabView pod={pod} />);
  }

  renderInstancesTabView() {
    let {pod} = this.props;

    return (<PodInstancesTabView pod={pod} />);
  }

  render() {
    const {pod} = this.props;
    const {activeActionDialog} = this.state;

    return (
      <div className="flex-container-col">
        <div className="container-pod container-pod-divider-bottom-align-right container-pod-short-top flush-bottom flush-top media-object-spacing-wrapper media-object-spacing-narrow">
          <Breadcrumbs />
          <PodHeader
            onAction={this.handleAction}
            pod={pod}
            tabs={this.tabs_getUnroutedTabs()} />
          {this.tabs_getTabView()}
        </div>

        <ServiceScaleFormModal
          onClose={this.handleCloseDialog}
          open={activeActionDialog === PodActionItem.SCALE}
          service={pod} />
        <ServiceDestroyModal
          onClose={this.handleCloseDialog}
          open={activeActionDialog === PodActionItem.DESTROY}
          service={pod} />
        <ServiceSuspendModal
          onClose={this.handleCloseDialog}
          open={activeActionDialog === PodActionItem.SUSPEND}
          service={pod} />
        <ServiceFormModal
          onClose={this.handleCloseDialog}
          open={activeActionDialog === PodActionItem.EDIT}
          isEdit={true}
          service={pod} />

      </div>
    );
  }
}

PodDetail.contextTypes = {
  router: React.PropTypes.func
};

PodDetail.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetail;
