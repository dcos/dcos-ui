import BreadcrumbSegment from '../../../../../../../src/js/components/BreadcrumbSegment';
import CompositeState from '../../../../../../../src/js/structs/CompositeState';

class NodeDetailBreadCrumb extends BreadcrumbSegment {
  componentDidMount() {
    this.updateCrumbSatus();
  }

  componentWillReceiveProps() {
    this.updateCrumbSatus();
  }

  updateCrumbSatus() {
    const hostname = this.getHostname();

    if (hostname) {
      this.setState({isLoadingCrumb: false});
    }
  }

  getHostname() {
    const {nodeID} = this.props.params;
    const node = CompositeState.getNodesList().filter(
      {ids: [nodeID]}
    ).last();

    return node.hostname;
  }

  getCrumbLabel() {
    return this.getHostname();
  }
};

module.exports = NodeDetailBreadCrumb;
