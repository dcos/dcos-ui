import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";
import Page from "../../../../../../src/js/components/Page";
import UnitsHealthNodeDetail
  from "../../../../../../src/js/components/UnitsHealthNodeDetail";
import UnitHealthStore from "../../../../../../src/js/stores/UnitHealthStore";

class NodesUnitsHealthDetailPage extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "unitHealth",
        events: ["unitSuccess", "nodeSuccess"]
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    const { unitID, unitNodeID } = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  render() {
    const { unitID, nodeID } = this.props.params;
    const breadcrumbs = <NodeBreadcrumbs nodeID={nodeID} unitID={unitID} />;

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <UnitsHealthNodeDetail params={this.props.params} />
      </Page>
    );
  }
}

module.exports = NodesUnitsHealthDetailPage;
