import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import UnitHealthStore from '../../../stores/UnitHealthStore';

class UnitsHealthDetailBreadcrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'unitHealth',
        events: ['unitSuccess']
      }
    ];
  }

  componentDidMount() {
    super.componentDidMount();

    let {unitID} = this.props.parentRouter.getCurrentParams();
    let unit = UnitHealthStore.getUnit(unitID);

    if (unit.get('id')) {
      this.setState({isLoadingCrumb: false});
    } else {
      UnitHealthStore.fetchUnit(unitID);
    }
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({isLoadingCrumb: false});
  }

  getCrumbLabel() {
    let {unitID} = this.props.parentRouter.getCurrentParams();
    let unit = UnitHealthStore.getUnit(unitID);

    return unit.getTitle();
  }
};

module.exports = UnitsHealthDetailBreadcrumb;
