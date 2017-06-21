import React from "react";

import Breadcrumb from "./Breadcrumb";
import Icon from "./Icon";

function BreadcrumbCaret() {
  return (
    <Breadcrumb isCaret={true} title="Caret">
      <Icon color="light-grey" id="caret-right" size="mini" />
    </Breadcrumb>
  );
}

module.exports = BreadcrumbCaret;
