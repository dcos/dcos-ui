import mixin from 'reactjs-mixin';
import {Link} from 'react-router';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Loader from '../../components/Loader';
import Page from '../../components/Page';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import UnitHealthStore from '../../stores/UnitHealthStore';
import UnitsHealthNodeDetailPanel from './units-health-node-detail/UnitsHealthNodeDetailPanel';
import UnitSummaries from '../../constants/UnitSummaries';

const UnitHealthNodeDetailBreadcrumbs = ({node, unit}) => {
  const crumbs = [
    <Link to="/components" key={-1}>Components</Link>
  ];

  if (unit != null) {
    let unitTitle = unit.getTitle();

    crumbs.push(
      <Link to={`/components/${unit.get('id')}`} key={-1}>{unitTitle}</Link>
    );
  }

  if (node != null && unit != null) {
    const nodeIP = node.get('host_ip');
    const healthStatus = node.getHealth();

    crumbs.push(
      <Link to={`/components/${unit.get('id')}/${nodeIP}`} key={1}>
        {`${nodeIP} `}
        <span className={healthStatus.classNames}>
          ({healthStatus.title})
        </span>
      </Link>
    );
  }

  return <Page.Header.Breadcrumbs iconID="components" breadcrumbs={crumbs} />;
};

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
    super.componentDidMount(...arguments);
    const {unitID, unitNodeID} = this.props.params;

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

  getErrorNotice() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getContent() {
    const {hasError, isLoadingNode, isLoadingUnit} = this.state;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoadingNode || isLoadingUnit) {
      return this.getLoadingScreen();
    }

    const {unitID, unitNodeID} = this.props.params;

    const node = UnitHealthStore.getNode(unitNodeID);
    const unit = UnitHealthStore.getUnit(unitID);

    const unitSummary = UnitSummaries[unit.get('id')] || {};
    let unitDocsURL = unitSummary.getDocumentationURI &&
      unitSummary.getDocumentationURI();

    return (
      <UnitsHealthNodeDetailPanel
        routes={this.props.routes}
        params={this.props.params}
        docsURL={unitDocsURL}
        hostIP={node.get('host_ip')}
        output={node.getOutput()}
        summary={unitSummary.summary} />
    );
  }

  render() {
    const {unitID, unitNodeID} = this.props.params;

    let node = UnitHealthStore.getNode(unitNodeID);
    let unit = UnitHealthStore.getUnit(unitID);

    return (
      <Page>
        <Page.Header breadcrumbs={
          <UnitHealthNodeDetailBreadcrumbs node={node} unit={unit} />
        } />
        {this.getContent()}
      </Page>
    );
  }
}
module.exports = UnitsHealthNodeDetail;
