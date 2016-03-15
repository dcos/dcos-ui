import React from 'react';

import SidebarHealthFilter from './SidebarHealthFilter';

const PropTypes = React.PropTypes;

class ServiceSidebarFilter extends React.Component {
  render() {
    return (
      <div>
        <SidebarHealthFilter />
      </div>
    );
  }
}

ServiceSidebarFilter.propTypes = {
};

ServiceSidebarFilter.defaultProps = {
};

module.exports = ServiceSidebarFilter;
