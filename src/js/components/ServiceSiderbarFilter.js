import React from 'react';

import FilterTypes from '../constants/FilterTypes';
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
          filterType={FilterTypes.HEALTH}
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
