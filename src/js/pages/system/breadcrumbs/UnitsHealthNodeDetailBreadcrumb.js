import BreadcrumbSegment from "../../../components/BreadcrumbSegment";
import UnitHealthStore from "../../../stores/UnitHealthStore";

class UnitsHealthNodeDetailBreadcrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "unitHealth",
        events: ["nodeSuccess"]
      }
    ];
  }

  componentDidMount() {
    const { unitID, unitNodeID } = this.props.params;
    const node = UnitHealthStore.getNode(unitNodeID);

    if (node.get("host_ip")) {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({ isLoadingCrumb: false });
      /* eslint-enable react/no-did-mount-set-state */
    } else {
      UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
    }
  }

  onUnitHealthStoreNodeSuccess() {
    this.setState({ isLoadingCrumb: false });
  }

  getCrumbLabel() {
    const { unitNodeID } = this.props.params;
    const node = UnitHealthStore.getNode(unitNodeID);

    return node.get("host_ip");
  }
}

module.exports = UnitsHealthNodeDetailBreadcrumb;
