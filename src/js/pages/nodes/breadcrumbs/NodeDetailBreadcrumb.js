import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import CompositeState from '../../../structs/CompositeState';

class NodeDetailBreadCrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);
  }

  componentDidMount() {
    super.componentDidMount();

    let hostname = this.getHostname();

    if (hostname) {
      this.setState({isLoadingCrumb: false});
    }
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);

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
