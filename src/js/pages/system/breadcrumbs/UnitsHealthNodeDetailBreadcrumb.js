import Breadcrumb from '../../../components/Breadcrumb';
import UnitHealthStore from '../../../stores/UnitHealthStore';

const FLAGS = {
  NODE_LOADED: parseInt('1', 2)
};

class UnitsHealthNodeDetailBreadcrumb extends Breadcrumb {
  constructor() {
    super(...arguments);

    this.state.isLoadingCrumb = FLAGS.NODE_LOADED;

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['nodeSuccess']
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount();

    let {unitID, unitNodeID} = this.props.parentRouter.getCurrentParams();
    let node = UnitHealthStore.getNode(unitNodeID);

    if (node.get('host_ip')) {
      let isLoadingCrumb = this.state.isLoadingCrumb & ~FLAGS.NODE_LOADED;
      this.setState({isLoadingCrumb});
    } else {
      UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
    }
  }

  onUnitHealthStoreNodeSuccess() {
    let isLoadingCrumb = this.state.isLoadingCrumb & ~FLAGS.NODE_LOADED;
    this.setState({isLoadingCrumb});
  }

  getCrumbLabel() {
    let {unitNodeID} = this.props.parentRouter.getCurrentParams();
    let node = UnitHealthStore.getNode(unitNodeID);

    return node.get('host_ip');
  }
};

module.exports = UnitsHealthNodeDetailBreadcrumb;
