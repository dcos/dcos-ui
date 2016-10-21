import mixin from 'reactjs-mixin';
import React from 'react';

import Breadcrumbs from '../../../../../src/js/components/Breadcrumbs';
import Pod from '../structs/Pod';
import PodActionItem from '../constants/PodActionItem';
import PodConfigurationTabView from '../components/PodConfigurationTabView';
import PodDebugTabView from '../components/PodDebugTabView';
import PodHeader from '../components/PodHeader';
import PodInstancesTabView from '../components/PodInstancesTabView';
import ServiceDestroyModal from '../components/modals/ServiceDestroyModal';
import ServiceFormModal from '../components/modals/ServiceFormModal';
import ServiceScaleFormModal from '../components/modals/ServiceScaleFormModal';
import ServiceSuspendModal from '../components/modals/ServiceSuspendModal';
import TabsMixin from '../../../../../src/js/mixins/TabsMixin';

const METHODS_TO_BIND = [
  'handleActionDestroy',
  'handleActionEdit',
  'handleActionScale',
  'handleActionSuspend',
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

  handleActionDestroy() {
    this.setState({
      activeActionDialog: PodActionItem.DESTROY
    });

  }

  handleActionEdit() {
    this.setState({
      activeActionDialog: PodActionItem.EDIT
    });

  }

  handleActionScale() {
    this.setState({
      activeActionDialog: PodActionItem.SCALE
    });

  }

  handleActionSuspend() {
    this.setState({
      activeActionDialog: PodActionItem.SUSPEND
    });

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
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <PodHeader
          onAction={this.handleAction}
          pod={pod}
          tabs={this.tabs_getUnroutedTabs()} />
        {this.tabs_getTabView()}
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
  router: React.PropTypes.object
};

PodDetail.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetail;
