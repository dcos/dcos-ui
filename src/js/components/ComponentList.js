import classNames from "classnames";
import { Link } from "react-router";
import { List } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";

class ComponentList extends React.Component {
  getComponentListContent(units) {
    return units.map(function(unit) {
      const health = unit.getHealth();
      const healthClasses = classNames("text-align-right", health.classNames);
      const unitID = unit.get("id");

      return {
        content: [
          {
            className: "dashboard-health-list-item-description text-overflow",
            content: (
              <Link
                to={`/components/${unitID}`}
                className="dashboard-health-list-item-cell emphasis"
              >
                {unit.getTitle()}
              </Link>
            ),
            tag: "span"
          },
          {
            className: "dashboard-health-list-health-label",
            content: (
              <div key="health" className={healthClasses}>
                {health.title}
              </div>
            ),
            tag: "div"
          }
        ]
      };
    });
  }

  /**
   * Order health status
   * based on HealthSorting mapping value
   * where lowest (0) (top of the list) is most important for visibility
   * and highest (3) (bottom of the list) 3 is least important for visibility
   *
   * @param {Array} items
   * @returns {Number} item position
   */
  getSortedHealthValues(items) {
    items.sort(function(a, b) {
      let aHealthScore = a.getHealth().sortingValue;
      let bHealthScore = b.getHealth().sortingValue;

      if (aHealthScore === bHealthScore) {
        aHealthScore = a.getTitle();
        bHealthScore = b.getTitle();
      }

      if (aHealthScore > bHealthScore) {
        return 1;
      }

      if (aHealthScore < bHealthScore) {
        return -1;
      }

      return 0;
    });

    return items;
  }

  /**
   * Check if the number of units is greater
   * than the number of possible visible units
   * return the only what can be visible
   *
   * @param {Array} units
   * @returns {Array} only units visible
   *
   * @memberOf ComponentList
   */
  getVisibleComponents(units) {
    const { displayCount } = this.props;

    if (units.length > displayCount) {
      return units.slice(0, displayCount);
    }

    return units;
  }

  getErrorMessage() {
    return (
      <div>
        <h3 className="flush-top text-align-center">Components Not Found</h3>
        <p className="flush text-align-center">An error has occurred.</p>
      </div>
    );
  }

  render() {
    let { units } = this.props;
    units = units.getItems();

    if (units.length === 0) {
      return this.getErrorMessage();
    }

    const sortedUnits = this.getSortedHealthValues(units);
    const visibleUnits = this.getVisibleComponents(sortedUnits);
    const content = this.getComponentListContent(visibleUnits);

    return (
      <div className="dashboard-health-list">
        <List
          className="list list-unstyled"
          content={content}
          transition={false}
        />
      </div>
    );
  }
}

ComponentList.defaultProps = {
  displayCount: 0
};

ComponentList.propTypes = {
  displayCount: PropTypes.number,
  // Required object of type HealthUnitsList.
  units: PropTypes.object.isRequired
};

module.exports = ComponentList;
