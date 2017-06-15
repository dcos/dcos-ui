import React from "react";

import Config from "../config/Config";
import logoURI from "../../img/layout/sidebar/dcos-ee-logo-styled.svg";

class DCOSLogo extends React.Component {
  render() {
    return (
      <img
        alt={`${Config.productName} Logo`}
        className="dcos-logo sidebar-header-image-inner"
        src={logoURI}
      />
    );
  }
}

module.exports = DCOSLogo;
