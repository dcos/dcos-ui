import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import UnitHealthStore from '../../../stores/UnitHealthStore';

class UnitsHealthNodeDetailBreadcrumb
extends mixin(BreadcrumbSegment, StoreMixin) {
  constructor() {
    super(...arguments);

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
      this.setState({isLoadingCrumb: false});
    } else {
      UnitHealthStore.fetchUnitNode(unitID, unitNodeID);
    }
  }

  onUnitHealthStoreNodeSuccess() {
    this.setState({isLoadingCrumb: false});
  }

  getCrumbLabel() {
    let {unitNodeID} = this.props.parentRouter.getCurrentParams();
    let node = UnitHealthStore.getNode(unitNodeID);

    return node.get('host_ip');
  }
};

module.exports = UnitsHealthNodeDetailBreadcrumb;
