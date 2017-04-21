import React, { PropTypes } from "react";

import ServiceFilterTypes from "../../constants/ServiceFilterTypes";
import HealthTypes from "../../constants/HealthTypes";
import ServiceOtherTypes from "../../constants/ServiceOtherTypes";
import ServiceOtherLabels from "../../constants/ServiceOtherLabels";
import ServiceStatusLabels from "../../constants/ServiceStatusLabels";
import ServiceStatusTypes from "../../constants/ServiceStatusTypes";
import HealthLabels from "../../constants/HealthLabels";
import SidebarLabelsFilter from "./SidebarLabelsFilter";
import SidebarFilter from "./SidebarFilter";

class ServiceSidebarFilters extends React.Component {
  render() {
    const { props } = this;
    const { countByValue, filters } = props;

    return (
      <div className="services-sidebar hidden-large-down pod flush-top flush-bottom flush-left">
        <SidebarFilter
          countByValue={countByValue.filterHealth}
          filters={filters}
          filterType={ServiceFilterTypes.HEALTH}
          filterValues={HealthTypes}
          filterLabels={HealthLabels}
          handleFilterChange={this.props.handleFilterChange}
          title="HEALTH"
        />
        <SidebarFilter
          countByValue={countByValue.filterStatus}
          filters={filters}
          filterType={ServiceFilterTypes.STATUS}
          filterValues={ServiceStatusTypes}
          filterLabels={ServiceStatusLabels}
          handleFilterChange={this.props.handleFilterChange}
          title="STATUS"
        />
        <SidebarLabelsFilter {...props} />
        <SidebarFilter
          countByValue={countByValue.filterOther}
          filters={filters}
          filterType={ServiceFilterTypes.OTHER}
          filterValues={ServiceOtherTypes}
          filterLabels={ServiceOtherLabels}
          handleFilterChange={this.props.handleFilterChange}
          title="OTHER"
        />
      </div>
    );
  }
}

ServiceSidebarFilters.propTypes = {
  countByValue: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = ServiceSidebarFilters;
