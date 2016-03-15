import React from 'react';

import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import HealthTypes from '../constants/HealthTypes';
import HealthLabels from '../constants/HealthLabels';
import SidebarFilter from './SidebarFilter';

const PropTypes = React.PropTypes;

function getCountByHealth(services) {
  return services.reduce(function (acc, service) {
    let serviceHealth = service.getHealth();
    if (acc[serviceHealth.value] === undefined) {
      acc[serviceHealth.value] = 1;
    } else {
      acc[serviceHealth.value]++;
    }
    return acc;
  }, {});
}

class ServiceSidebarFilters extends React.Component {
  render() {
    let {props} = this;

    return (
      <div>
        <SidebarFilter
          countByValue={getCountByHealth(props.services)}
          filterType={ServiceFilterTypes.HEALTH}
          filterValues={HealthTypes}
          filterLabels={HealthLabels}
          handleFilterChange={props.handleFilterChange}
          title="HEALTH" />
      </div>
    );
  }
}

ServiceSidebarFilters.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = ServiceSidebarFilters;
