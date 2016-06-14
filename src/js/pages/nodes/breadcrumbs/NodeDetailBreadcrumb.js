import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import CompositeState from '../../../structs/CompositeState';

class NodeDetailBreadCrumb extends BreadcrumbSegment {
  componentDidMount() {
    super.componentDidMount();
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
