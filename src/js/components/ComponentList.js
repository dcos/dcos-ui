import classNames from 'classnames';
import {Link} from 'react-router';
import {List} from 'reactjs-components';
import React from 'react';

import HealthTypes from '../../../plugins/services/src/js/constants/HealthTypes';

class ComponentList extends React.Component {

  getComponentListContent(units) {
    return units.map(function (unit) {
      let health = unit.getHealth();
      let healthClasses = classNames('text-align-right', health.classNames);
      let unitID = unit.get('id');

      return {
        content: [
          {
            className: 'dashboard-health-list-item-description text-overflow',
            content: (
              <Link to={`/components/${unitID}`}
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
    // HealthTypes gives the sorting weight.
    units = units.sort(function (a, b) {
      let aHealth = a.getHealth().title.toUpperCase();
      let bHealth = b.getHealth().title.toUpperCase();
      let comparison = HealthTypes[aHealth] - HealthTypes[bHealth];

      if (comparison === 0) {
        let aTitle = a.getTitle();
        let bTitle = b.getTitle();

        if (aTitle > bTitle) {
          return 1;
        }

        if (aTitle < bTitle) {
          return -1;
        }

        return 0;
      }

      return comparison;
    });

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
