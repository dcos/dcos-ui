import BreadcrumbSegment from '../../../components/BreadcrumbSegment';
import UnitHealthStore from '../../../stores/UnitHealthStore';

const FLAGS = {
  UNIT_LOADED: parseInt('1', 2)
};

class UnitsHealthDetailBreadcrumb extends BreadcrumbSegment {
  constructor() {
    super(...arguments);

    this.state.isLoadingCrumb = FLAGS.UNIT_LOADED;

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
      let isLoadingCrumb = this.state.isLoadingCrumb & ~FLAGS.UNIT_LOADED;
      this.setState({isLoadingCrumb});
    } else {
      UnitHealthStore.fetchUnit(unitID);
    }
  }

  onUnitHealthStoreUnitSuccess() {
    let isLoadingCrumb = this.state.isLoadingCrumb & ~FLAGS.UNIT_LOADED;
    this.setState({isLoadingCrumb});
  }

  getCrumbLabel() {
    let {unitID} = this.props.parentRouter.getCurrentParams();
    let unit = UnitHealthStore.getUnit(unitID);

    return unit.getTitle();
  }
};

module.exports = UnitsHealthDetailBreadcrumb;
