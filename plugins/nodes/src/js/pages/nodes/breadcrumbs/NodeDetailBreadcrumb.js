import BreadcrumbSegment from "#SRC/js/components/BreadcrumbSegment";
import CompositeState from "#SRC/js/structs/CompositeState";

class NodeDetailBreadCrumb extends BreadcrumbSegment {
  componentDidMount() {
    this.updateCrumbStatus();
  }

  componentWillReceiveProps() {
    this.updateCrumbStatus();
  }

  updateCrumbStatus() {
    const hostname = this.getHostname();

    if (hostname) {
      this.setState({ isLoadingCrumb: false });
    }
  }

  getHostname() {
    const { nodeID } = this.props.params;
    const node = CompositeState.getNodesList().filter({ ids: [nodeID] }).last();

    return node.hostname;
  }

  getCrumbLabel() {
    return this.getHostname();
  }
}

module.exports = NodeDetailBreadCrumb;
