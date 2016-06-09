import React from 'react';

import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import HealthTypes from '../constants/HealthTypes';
import ServiceStatusLabels from '../constants/ServiceStatusLabels';
import ServiceStatusTypes from '../constants/ServiceStatusTypes';
import HealthLabels from '../constants/HealthLabels';
import SidebarFilter from './SidebarFilter';

const PropTypes = React.PropTypes;

function getCountByFilters(services) {

  return services.reduce(function (memo, service) {
    let serviceStatus = service.getServiceStatus();
    let serviceHealth = service.getHealth();

    if (memo.statusCount[serviceStatus.key] === undefined) {
      memo.statusCount[serviceStatus.key] = 1;
    } else {
      memo.statusCount[serviceStatus.key]++;
    }

    if (memo.healthCount[serviceHealth.value] === undefined) {
      memo.healthCount[serviceHealth.value] = 1;
    } else {
      memo.healthCount[serviceHealth.value]++;
    }

    }

    return memo;
  }, {healthCount: {}, statusCount: {}, otherCount: {}});
}

class ServiceSidebarFilters extends React.Component {
  render() {
    let {props} = this;
    let {
      healthCount,
      statusCount,
      otherCount
    } = getCountByFilters(props.services);

    return (
      <div>
        <SidebarFilter
          countByValue={healthCount}
          filterType={ServiceFilterTypes.HEALTH}
          filterValues={HealthTypes}
          filterLabels={HealthLabels}
          handleFilterChange={props.handleFilterChange}
          title="HEALTH" />
        <SidebarFilter
          countByValue={statusCount}
          filterType={ServiceFilterTypes.STATUS}
          filterValues={ServiceStatusTypes}
          filterLabels={ServiceStatusLabels}
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
