import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import Loader from "./Loader";
import RequestErrorMsg from "./RequestErrorMsg";
import UnitHealthStore from "../stores/UnitHealthStore";
import UnitsHealthNodeDetailPanel
  from "../pages/system/units-health-node-detail/UnitsHealthNodeDetailPanel";
import UnitSummaries from "../constants/UnitSummaries";

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
        name: "unitHealth",
        events: ["unitSuccess", "unitError", "nodeSuccess", "nodeError"],
        suppressUpdate: true
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
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
    const { hasError, isLoadingNode, isLoadingUnit } = this.state;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoadingNode || isLoadingUnit) {
      return this.getLoadingScreen();
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

module.exports = UnitsHealthNodeDetail;
