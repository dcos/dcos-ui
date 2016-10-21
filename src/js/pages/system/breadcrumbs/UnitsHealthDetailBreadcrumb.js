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
    let {unitID} = this.props.params;
    let unit = UnitHealthStore.getUnit(unitID);

    if (unit.get('id')) {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({isLoadingCrumb: false});
      /* eslint-enable react/no-did-mount-set-state */
    } else {
      UnitHealthStore.fetchUnit(unitID);
    }
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({isLoadingCrumb: false});
  }

  getCrumbLabel() {
    let {unitID} = this.props.params;
    let unit = UnitHealthStore.getUnit(unitID);

    return unit.getTitle();
  }
};

module.exports = UnitsHealthDetailBreadcrumb;
