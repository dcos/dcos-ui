import React from 'react';

import ServiceFilterTypes from '../constants/ServiceFilterTypes';
import HealthTypes from '../constants/HealthTypes';
import HealthLabels from '../constants/HealthLabels';
import SidebarFilter from './SidebarFilter';

const PropTypes = React.PropTypes;

class ServiceSidebarFilter extends React.Component {
  render() {
    return (
      <div>
        <SidebarFilter
          countByValue={this.props.countByHealth}
          filterType={ServiceFilterTypes.HEALTH}
          filterValues={HealthTypes}
          filterLabels={HealthLabels}
          handleFilterChange={this.props.handleFilterChange}
          title="HEALTH" />
      </div>
    );
  }
}

ServiceSidebarFilter.propTypes = {
  countByHealth: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired
};

module.exports = ServiceSidebarFilter;
