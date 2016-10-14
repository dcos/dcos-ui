import BreadcrumbSegment from '../../../../../../../src/js/components/BreadcrumbSegment';
import CompositeState from '../../../../../../../src/js/structs/CompositeState';

class NodeDetailBreadCrumb extends BreadcrumbSegment {
  componentDidMount() {
    this.updateCrumbSatus();
  }

  componentWillReceiveProps() {
    super.componentWillReceiveProps(...arguments);
    this.updateCrumbSatus();
  }

  updateCrumbSatus() {
    let hostname = this.getHostname();

    if (hostname) {
      this.setState({isLoadingCrumb: false});
    }
  }

  getHostname() {
    let {nodeID} = this.props.parentRouter.getCurrentParams();
    let node = CompositeState.getNodesList().filter(
      {ids: [nodeID]}
    ).last();

    return node.hostname;
  }

  getCrumbLabel() {
    return this.getHostname();
  }
};

module.exports = NodeDetailBreadCrumb;
