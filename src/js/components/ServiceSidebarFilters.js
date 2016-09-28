import React from 'react';

import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import Framework from '../structs/Framework';
import Pod from '../structs/Pod';
import HealthTypes from '../constants/HealthTypes';
import ServiceOther from '../constants/ServiceOther';
import ServiceOtherTypes from '../constants/ServiceOtherTypes';
import ServiceOtherLabels from '../constants/ServiceOtherLabels';
import ServiceStatusLabels from '../constants/ServiceStatusLabels';
import ServiceStatusTypes from '../constants/ServiceStatusTypes';
import ServiceTree from '../structs/ServiceTree';
import HealthLabels from '../constants/HealthLabels';
import SidebarLabelsFilter from './SidebarLabelsFilter';
import SidebarFilter from './SidebarFilter';

const PropTypes = React.PropTypes;

function getCountByFilters(services) {
  const universeKey = ServiceOther.UNIVERSE.key;
  const volumesKey = ServiceOther.VOLUMES.key;
  const podsKey = ServiceOther.PODS.key;

  return services.reduce(function (memo, service) {
    if (service instanceof ServiceTree) {
      return memo;
    }

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

    if (service instanceof Framework) {
      if (memo.otherCount[universeKey] === undefined) {
        memo.otherCount[universeKey] = 1;
      } else {
        memo.otherCount[universeKey]++;
      }
    }

    if (service instanceof Pod) {
      if (memo.otherCount[podsKey] === undefined) {
        memo.otherCount[podsKey] = 1;
      } else {
        memo.otherCount[podsKey]++;
      }
    }

    let volumes = service.getVolumes();
    if (volumes.list && volumes.list.length > 0 ) {
      if (memo.otherCount[volumesKey] === undefined) {
        memo.otherCount[volumesKey] = 1;
      } else {
        memo.otherCount[volumesKey]++;
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
      <div className="flex-no-shrink column-12 column-large-3 column-jumbo-2 hidden-small-down">
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
        <SidebarLabelsFilter {...props}/>
        <SidebarFilter
          countByValue={otherCount}
          filterType={ServiceFilterTypes.OTHER}
          filterValues={ServiceOtherTypes}
          filterLabels={ServiceOtherLabels}
          handleFilterChange={props.handleFilterChange}
          title="OTHER" />
      </div>
    );
  }
}

ServiceSidebarFilters.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = ServiceSidebarFilters;
