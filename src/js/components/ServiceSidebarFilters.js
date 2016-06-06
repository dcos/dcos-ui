import React from 'react';

import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import HealthTypes from '../constants/HealthTypes';
import StatusLabels from '../constants/StatusLabels';
import StatusTypes from '../constants/StatusTypes';
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

function getCountByStatus(services) {
  return services.reduce(function (acc, service) {
    let serviceStatus = service.getServiceStatus();

    if (acc[serviceStatus.key] === undefined) {
      acc[serviceStatus.key] = 1;
    } else {
      acc[serviceStatus.key]++;
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
        <SidebarFilter
          countByValue={getCountByStatus(props.services)}
          filterType={ServiceFilterTypes.STATUS}
          filterValues={StatusTypes}
          filterLabels={StatusLabels}
          handleFilterChange={props.handleFilterChange}
          title="STATUS" />
      </div>
    );
  }
}

ServiceSidebarFilters.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = ServiceSidebarFilters;
