import mixin from "reactjs-mixin";
import * as React from "react";

import Page from "#SRC/js/components/Page";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import UnitsHealthNodeDetail from "#SRC/js/components/UnitsHealthNodeDetail";
import UnitHealthStore from "#SRC/js/stores/UnitHealthStore";
import { withNode } from "#SRC/js/stores/MesosSummaryFetchers";

import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";

class NodesUnitsHealthDetailPage extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "unitHealth", events: ["unitSuccess", "nodeSuccess"] }
    ];
  }

  componentDidMount(...args) {
    super.componentDidMount(...args);
    const { unitID, unitNodeID } = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  render() {
    const { node, params } = this.props;
    const { unitID } = params;
    const breadcrumbs = <NodeBreadcrumbs node={node} unitID={unitID} />;

    return (
      <Page>
        <Page.Header breadcrumbs={breadcrumbs} />
        <UnitsHealthNodeDetail params={this.props.params} />
      </Page>
    );
  }
}

export default withNode(NodesUnitsHealthDetailPage);
