import React from 'react';

import SidebarHealthFilter from './SidebarHealthFilter';

const PropTypes = React.PropTypes;

class ServiceSidebarFilter extends React.Component {
  render() {
    return (
      <div>
        <SidebarHealthFilter
          countByHealth={this.props.countByHealth}
          handleFilterChange={this.props.handleFilterChange} />
      </div>
    );
  }
}

ServiceSidebarFilter.propTypes = {
  countByHealth: React.PropTypes.object.isRequired,
  handleFilterChange: React.PropTypes.func.isRequired
};

ServiceSidebarFilter.defaultProps = {
};

module.exports = ServiceSidebarFilter;
