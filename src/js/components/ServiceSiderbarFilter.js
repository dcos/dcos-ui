import React from 'react';

import SidebarHealthFilter from './SidebarHealthFilter';

const PropTypes = React.PropTypes;

class ServiceSidebarFilter extends React.Component {
  render() {
    return (
      <div>
        <SidebarHealthFilter countByHealth={this.props.countByHealth} />
      </div>
    );
  }
}

ServiceSidebarFilter.propTypes = {
  countByHealth: React.PropTypes.object.isRequired
};

ServiceSidebarFilter.defaultProps = {
};

module.exports = ServiceSidebarFilter;
