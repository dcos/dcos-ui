import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Loader from '../../components/Loader';
import RequestErrorMsg from '../../components/RequestErrorMsg';
import UnitHealthStore from '../../stores/UnitHealthStore';
import UnitsHealthNodeDetailPanel from
  './units-health-node-detail/UnitsHealthNodeDetailPanel';
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
    super.componentDidMount(...arguments);
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

    let healthStatus = node.getHealth();

    let unitSummary = UnitSummaries[unit.get('id')] || {};
    let unitDocsURL = unitSummary.getDocumentationURI &&
        unitSummary.getDocumentationURI();

    return (
      <UnitsHealthNodeDetailPanel
        routes={this.props.routes}
        params={this.props.params}
        docsURL={unitDocsURL}
        healthStatus={healthStatus.title}
        healthStatusClassNames={healthStatus.classNames}
        hostIP={node.get('host_ip')}
        pageHeaderTitle={`${unit.getTitle()} Health Check`}
        output={node.getOutput()}
        summary={unitSummary.summary} />
    );
  }
}
module.exports = UnitsHealthNodeDetail;
