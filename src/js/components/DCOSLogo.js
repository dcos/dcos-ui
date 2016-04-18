import React from 'react';

import Config from '../config/Config';

class DCOSLogo extends React.Component {
  render() {
    return (
      <img
        alt={`${Config.productName} Logo`}
        className="dcos-logo sidebar-header-image-inner"
        src="./img/layout/sidebar/dcos-ee-logo-styled.svg" />
    );
  }
}

module.exports = DCOSLogo;
