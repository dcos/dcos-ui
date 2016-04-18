/*eslint-disable no-unused-vars*/
import React from 'react';
/*eslint-enable no-unused-vars*/

import {documentationURI} from '../config/Config';
import RequestErrorMsg from './RequestErrorMsg';
import SidePanelContents from './SidePanelContents';
import UnitHealthStore from '../stores/UnitHealthStore';
import UnitSummaries from '../constants/UnitSummaries';

module.exports = class UnitNodeSidePanelContents extends SidePanelContents {

  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess', 'unitError', 'nodeSuccess', 'nodeError']
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount();

    let {unitID, unitNodeID} = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  getHeader(unit, node) {
    let imageTag = (
      <div className="side-panel-icon icon icon-large icon-image-container
        icon-app-container">
        <img src="./img/services/icon-service-default-medium@2x.png" />
      </div>
    );

    return (
      <div className="side-panel-content-header-details flex-box
        flex-box-align-vertical-center">
        {imageTag}
        <div>
          <h1 className="side-panel-content-header-label flush">
            {`${unit.getTitle()} Health Check`}
          </h1>
          <div>
            {this.getSubHeader(unit, node)}
          </div>
        </div>
      </div>
    );
  }

  getErrorNotice() {
    return (
      <div className="container container-pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getSubHeader(unit, node) {
    let healthStatus = node.getHealth();

    return (
      <ul className="list-inline flush-bottom">
        <li>
          <span className={healthStatus.classNames}>
            {healthStatus.title}
          </span>
        </li>
        <li>
          {node.get('host_ip')}
        </li>
      </ul>
    );
  }

  getNodeInfo(node, unit) {
    let unitSummary = UnitSummaries[unit.get('id')] || {};
    let unitDocsURL = unitSummary.documentation_url;

    if (!unitDocsURL) {
      unitDocsURL = documentationURI;
    }

    return (
      <div className="flex-container-col flex-grow">
        <span className="h4">Summary</span>
        <p>
          {unitSummary.summary}
        </p>
        <p>
          <a href={unitDocsURL} target="_blank">
            View Documentation
          </a>
        </p>
        <span className="h4">Output</span>
        <pre className="flex-grow flush-bottom">
          {node.getOutput()}
        </pre>
      </div>
    );
  }

  render() {
    let {unitID, unitNodeID} = this.props.params;
    let node = UnitHealthStore.getNode(unitNodeID);
    let unit = UnitHealthStore.getUnit(unitID);

    return (
      <div className="flex-container-col">
        <div className="side-panel-section side-panel-content-header container container-pod container-fluid container-pod-divider-bottom container-pod-divider-bottom-align-right flush-bottom">
          <div className="container-pod container-pod-short flush-top">
            {this.getHeader(unit, node)}
          </div>
        </div>
        <div className="side-panel-tab-content side-panel-section container
          container-fluid container-pod container-pod-short container-fluid
          flex-container-col flex-grow">
          {this.getNodeInfo(node, unit)}
        </div>
      </div>
    );
  }
};
