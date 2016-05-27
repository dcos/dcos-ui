import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Breadcrumbs from '../../components/Breadcrumbs';
import {documentationURI} from '../../config/Config';
import PageHeader from '../../components/PageHeader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import serviceDefaultURI from '../../../img/services/icon-service-default-medium@2x.png';
import UnitHealthStore from '../../stores/UnitHealthStore';
import UnitSummaries from '../../constants/UnitSummaries';

const FLAGS = {
  UNIT_LOADED: parseInt('1', 2),
  NODE_LOADED: parseInt('10', 2)
};

class UnitsHealthNodeDetail extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isLoading: FLAGS.UNIT_LOADED | FLAGS.NODE_LOADED,
      hasError: false
    };

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

  onUnitHealthStoreUnitSuccess() {
    let isLoading = this.state.isLoading & ~FLAGS.UNIT_LOADED;
    this.setState({isLoading});
  }

  onUnitHealthStoreUnitError() {
    this.setState({hasError: true});
  }

  onUnitHealthStoreNodeSuccess() {
    let isLoading = this.state.isLoading & ~FLAGS.NODE_LOADED;
    this.setState({isLoading});
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
      <div className="container-pod text-align-center vertical-center inverse">
        <div className="row">
          <div className="ball-scale">
            <div />
          </div>
        </div>
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
    let {state} = this;

    if (state.hasError) {
      return this.getErrorNotice();
    }

    if (state.isLoading) {
      return this.getLoadingScreen();
    }

    let {unitID, unitNodeID} = this.props.params;
    let node = UnitHealthStore.getNode(unitNodeID);
    let unit = UnitHealthStore.getUnit(unitID);
    let serviceIcon = <img src={serviceDefaultURI} />;

    return (
      <div className="flex-container-col">
        <Breadcrumbs />
        <PageHeader
          icon={serviceIcon}
          iconClassName="icon-app-container"
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
