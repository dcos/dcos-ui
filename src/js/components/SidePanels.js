import mixin from 'reactjs-mixin';
import React from 'react';
import {SidePanel} from 'reactjs-components';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import HistoryStore from '../stores/HistoryStore';
import MesosSummaryStore from '../stores/MesosSummaryStore';
import NodeSidePanelContents from './NodeSidePanelContents';
import ServiceSidePanelContents from './ServiceSidePanelContents';
import StringUtil from '../utils/StringUtil';
import TaskSidePanelContents from './TaskSidePanelContents';
import UnitHealthSidePanelContents from './UnitHealthSidePanelContents';
import UnitNodeSidePanelContents from './UnitNodeSidePanelContents';
import Util from '../utils/Util';

const METHODS_TO_BIND = [
  'handlePanelClose',
  'handlePanelSizeChange'
];

class SidePanels extends mixin(StoreMixin) {
  constructor() {
    super();

    this.store_listeners = [
      {
        name: 'history',
        events: ['change']
      }
    ];

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);

    this.state = {
      sidePanelSize: 'large'
    };
  }

  handlePanelSizeChange(sidePanelSize) {
    this.setState({sidePanelSize});
  }

  handlePanelClose(closeInfo) {
    if (!this.isOpen(this.props.params)) {
      return;
    }

    let router = this.context.router;
    this.setState({sidePanelSize: 'large'});

    if (closeInfo && closeInfo.closedByBackdrop) {
      router.transitionTo(this.props.openedPage, router.getCurrentParams());
      return;
    }

    HistoryStore.goBack(router);
  }

  isOpen(itemIDs) {
    let {unitID, unitNodeID, nodeID, serviceName, taskID} = itemIDs;

    return (
      (unitNodeID != null && unitID != null) ||
      nodeID != null ||
      serviceName != null ||
      taskID != null ||
      unitID != null
    ) && MesosSummaryStore.get('statesProcessed');
  }

  getHeader() {
    let text = 'back';
    let prevPage = HistoryStore.getHistoryAt(-1);

    if (prevPage == null) {
      text = 'close';
    }

    if (prevPage) {
      let matchedRoutes = this.context.router.match(prevPage).routes;
      prevPage = Util.last(matchedRoutes).name;

      if (this.props.openedPage === prevPage) {
        text = 'close';
      }
    }

    return (
      <div className="side-panel-header-actions
        side-panel-header-actions-primary">
        <span className="side-panel-header-action"
          onClick={this.handlePanelClose}>
          <i className={`icon icon-sprite
            icon-sprite-small
            icon-${text}
            icon-sprite-small-white`}></i>
          {StringUtil.capitalize(text)}
        </span>
      </div>
    );
  }

  getContents(itemIDs) {
    if (!this.isOpen(itemIDs)) {
      return null;
    }

    let {unitID, unitNodeID, nodeID, serviceName, taskID} = itemIDs;

    if (unitID != null && unitNodeID != null) {
      return (
        <UnitNodeSidePanelContents
          itemID={unitID}
          params={this.props.params}
          parentRouter={this.context.router} />
      );
    }

    if (nodeID != null) {
      return (
        <NodeSidePanelContents
          itemID={nodeID}
          parentRouter={this.context.router} />
      );
    }

    if (taskID != null) {
      return (
        <TaskSidePanelContents
          handlePanelSizeChange={this.handlePanelSizeChange}
          itemID={taskID}
          parentRouter={this.context.router} />
      );
    }

    if (serviceName != null) {
      return (
        <ServiceSidePanelContents
          itemID={serviceName}
          parentRouter={this.context.router} />
      );
    }

    if (unitID != null) {
      return (
        <UnitHealthSidePanelContents
          itemID={unitID}
          parentRouter={this.context.router} />
      );
    }

    return null;
  }

  getSidePanelClass(size) {
    return (`side-panel flex-container-col container container-pod container-pod-short flush-top flush-bottom side-panel-${size}`);
  }

  render() {
    let params = this.props.params;

    return (
      <SidePanel className="side-panel-detail"
        header={this.getHeader()}
        headerContainerClass="side-panel-header-container container
          container-fluid container-fluid-narrow container-pod
          container-pod-short"
        bodyClass="side-panel-content flex-container-col"
        onClose={this.handlePanelClose}
        open={this.isOpen(params)}
        sidePanelClass={this.getSidePanelClass(this.state.sidePanelSize)}>
        {this.getContents(params)}
      </SidePanel>
    );
  }
}

SidePanels.contextTypes = {
  router: React.PropTypes.func
};

SidePanels.propTypes = {
  params: React.PropTypes.object
};

module.exports = SidePanels;
