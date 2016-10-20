import mixin from 'reactjs-mixin';
import React, {PropTypes} from 'react';
import {routerShape} from 'react-router';

import Breadcrumbs from '../../../../../../src/js/components/Breadcrumbs';
import Pod from '../../structs/Pod';
import PodConfigurationContainer from '../pod-configuration/PodConfigurationContainer';
import PodDebugContainer from '../pod-debug/PodDebugContainer';
import PodHeader from './PodHeader';
import PodInstancesContainer from '../pod-instances/PodInstancesContainer';
import TabsMixin from '../../../../../../src/js/mixins/TabsMixin';

const METHODS_TO_BIND = [
  'handleActionDestroy',
  'handleActionEdit',
  'handleActionScale',
  'handleActionSuspend'
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
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleActionDestroy() {
    const {pod} = this.props.pod;
    this.context.modalHandlers.deleteService({pod});
  }

  handleActionEdit() {
    const {pod} = this.props.pod;
    this.context.modalHandlers.editService({pod});
  }

  handleActionScale() {
    const {pod} = this.props.pod;
    this.context.modalHandlers.scaleService({pod});
  }

  handleActionSuspend() {
    const {pod} = this.props.pod;
    this.context.modalHandlers.suspendService({pod});
  }

  renderConfigurationTabView() {
    let {pod} = this.props;

    return (
      <PodConfigurationContainer pod={pod} />
    );
  }

  renderDebugTabView() {
    let {pod} = this.props;

    return (<PodDebugContainer pod={pod} />);
  }

  renderInstancesTabView() {
    let {pod} = this.props;

    return (<PodInstancesContainer pod={pod} />);
  }

  render() {
    const {pod} = this.props;

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <PodHeader
          onDestroy={this.handleActionDestroy}
          onEdit={this.handleActionEdit}
          onScale={this.handleActionScale}
          onSuspend={this.handleActionSuspend}
          pod={pod}
          tabs={this.tabs_getUnroutedTabs()} />
        {this.tabs_getTabView()}
      </div>
    );
  }
}

PodDetail.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired,
  router: routerShape
};

PodDetail.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetail;
