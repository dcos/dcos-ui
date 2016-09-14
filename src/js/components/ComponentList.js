import classNames from 'classnames';
import {Link} from 'react-router';
import {List} from 'reactjs-components';
import React from 'react';

import UnitHealthUtil from '../utils/UnitHealthUtil';

class ComponentList extends React.Component {

  getComponentListContent(units) {
    return units.map(function (unit) {
      let health = unit.getHealth();
      let healthClasses = classNames('text-align-right', health.classNames);

      return {
        content: [
          {
            className: 'dashboard-health-list-item-description text-overflow',
            content: (
              <Link to="system-overview-units-unit-nodes-detail"
                params={{unitID: unit.get('id')}}
                className="dashboard-health-list-item-cell emphasis">
                {unit.getTitle()}
              </Link>
            ),
            tag: 'span'
          },
          {
            className: 'dashboard-health-list-health-label',
            content: (
              <div key="health" className={healthClasses}>
                {health.title}
              </div>
            ),
            tag: 'div'
          }
        ]
      };
    });
  }

  getVisibleComponents(units, displayCount) {
    let sortFunction = UnitHealthUtil.getHealthSortFunction;

    units = units.sort(sortFunction('health'));

    if (units.length > displayCount) {
      return units.slice(0, displayCount);
    }

    return units;
  }

  getErrorMessage() {
    return (
      <div className="flex-item-align-center">
        <h3 className="flush-top text-align-center">Components Not Found</h3>
        <p className="flush text-align-center">An error has occurred.</p>
      </div>
    );
  }

  render() {
    let units = this.props.units.getItems();
    if (units.length === 0) {
      return this.getErrorMessage();
    }

    let {displayCount} = this.props;
    let visibleUnits = this.getVisibleComponents(units, displayCount);

    let content = this.getComponentListContent(visibleUnits);

    return (
      <div className="dashboard-health-list">
        <List
          className="list list-unstyled"
          content={content}
          transition={false} />
      </div>
    );
  }
}

ComponentList.defaultProps = {
  displayCount: 0
};

ComponentList.propTypes = {
  displayCount: React.PropTypes.number,
  // Required object of type HealthUnitsList.
  units: React.PropTypes.object.isRequired
};

module.exports = ComponentList;
