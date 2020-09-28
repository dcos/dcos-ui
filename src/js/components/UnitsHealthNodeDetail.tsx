import mixin from "reactjs-mixin";
import * as React from "react";

import StoreMixin from "#SRC/js/mixins/StoreMixin";

import Loader from "./Loader";
import RequestErrorMsg from "./RequestErrorMsg";
import UnitHealthStore from "../stores/UnitHealthStore";
import UnitsHealthNodeDetailPanel from "../pages/system/units-health-node-detail/UnitsHealthNodeDetailPanel";
import UnitSummaries from "../constants/UnitSummaries";

class UnitsHealthNodeDetail extends mixin(StoreMixin) {
  state = {
    hasError: false,
    isLoadingUnit: true,
    isLoadingNode: true,
  };

  // prettier-ignore
  store_listeners = [
    {name: "unitHealth", events: ["unitSuccess", "unitError", "nodeSuccess", "nodeError"], suppressUpdate: true}
  ];

  componentDidMount(...args) {
    super.componentDidMount(...args);
    const { unitID, unitNodeID } = this.props.params;

    UnitHealthStore.fetchUnit(unitID);
    UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({ isLoadingUnit: false });
  }

  onUnitHealthStoreUnitError() {
    this.setState({ hasError: true });
  }

  onUnitHealthStoreNodeSuccess() {
    this.setState({ isLoadingNode: false });
  }

  onUnitHealthStoreNodeError() {
    this.setState({ hasError: true });
  }

  render() {
    const { hasError, isLoadingNode, isLoadingUnit } = this.state;

    if (hasError) {
      return (
        <div className="pod">
          <RequestErrorMsg />
        </div>
      );
    }

    if (isLoadingNode || isLoadingUnit) {
      return <Loader />;
    }

    const { unitID, unitNodeID } = this.props.params;

    const node = UnitHealthStore.getNode(unitNodeID);
    const unit = UnitHealthStore.getUnit(unitID);

    const unitSummary = UnitSummaries[unit.get("id")] || {};
    const unitDocsURL =
      unitSummary.getDocumentationURI && unitSummary.getDocumentationURI();

    return (
      <UnitsHealthNodeDetailPanel
        routes={this.props.routes}
        params={this.props.params}
        docsURL={unitDocsURL}
        hostIP={node.get("host_ip")}
        output={node.getOutput()}
        summary={unitSummary.summary}
      />
    );
  }
}

export default UnitsHealthNodeDetail;
