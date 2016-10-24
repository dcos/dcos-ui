import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import {documentationURI} from '../../config/Config';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import UnitHealthStore from '../../stores/UnitHealthStore';
import UnitSummaries from '../../constants/UnitSummaries';

class UnitsHealthNodeDetail extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      hasError: false,
      isLoadingUnit: true,
      isLoadingNode: true
    };

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess', 'unitError', 'nodeSuccess', 'nodeError'],
        suppressUpdate: true
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount();

    let {unitID, unitNodeID} = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({isLoadingUnit: false});
  }

  onUnitHealthStoreUnitError() {
    this.setState({hasError: true});
  }

  onUnitHealthStoreNodeSuccess() {
    this.setState({isLoadingNode: false});
  }

  onUnitHealthStoreNodeError() {
    this.setState({hasError: true});
  }

  getSubTitle(unit, node) {
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

  getErrorNotice() {
    return (
      <div className="container container-pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return (
      <div className="container container-fluid container-pod">
        <Loader className="inverse" />
      </div>
    );
  }

  getNodeInfo(node, unit) {
    let unitSummary = UnitSummaries[unit.get('id')] || {};
    let unitDocsURL = unitSummary.getDocumentationURI &&
      unitSummary.getDocumentationURI();

    if (!unitDocsURL) {
      unitDocsURL = documentationURI;
    }

    return (
      <div className="flex-container-col flex-grow">
        <span className="h4 inverse flush-top">Summary</span>
        <p className="inverse">
          {unitSummary.summary}
        </p>
        <p className="inverse">
          <a href={unitDocsURL} target="_blank">
            View Documentation
          </a>
        </p>
        <span className="h4 inverse">Output</span>
        <pre className="flex-grow flush-bottom">
          {node.getOutput()}
        </pre>
      </div>
    );
  }

  render() {
    let {hasError, isLoadingNode, isLoadingUnit} = this.state;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoadingNode || isLoadingUnit) {
      return this.getLoadingScreen();
    }

    let {unitID, unitNodeID} = this.props.params;
    let node = UnitHealthStore.getNode(unitNodeID);
    let unit = UnitHealthStore.getUnit(unitID);

    return (
      <div className="flex-container-col">
        <Breadcrumbs />
        <PageHeader
          icon={<Icon color="neutral" id="heart-pulse" size="large" />}
          subTitle={this.getSubTitle(unit, node)}
          title={`${unit.getTitle()} Health Check`} />
        <div className="flex-container-col flex-grow no-overflow">
          {this.getNodeInfo(node, unit)}
        </div>
      </div>
    );
  }
};

module.exports = UnitsHealthNodeDetail;
