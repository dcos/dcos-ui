import React from "react";

import Panel from "../../components/Panel";

function CatalogPackageOption(props) {
  const { children, image, label, onOptionSelect } = props;
  const contentClasses = [
    "panel-cell horizontal-center text-align-center",
    {
      "panel-cell-shorter": false
    }
  ];
  const headingClasses = [
    "panel-cell panel-cell-borderless horizontal-center flush-bottom",
    {
      "panel-cell-light": false,
      "panel-cell-shorter": false
    }
  ];
  const footerClasses = [
    "panel-cell horizontal-center flush-top",
    {
      "panel-cell-short": false,
      "panel-cell-shorter": false
    }
  ];

  return (
    <div className="panel-grid-item column-6 column-small-4 column-large-3">
      <Panel
        className="panel-interactive clickable"
        contentClass={contentClasses}
        footer={label}
        footerClass={footerClasses}
        heading={image}
        headingClass={headingClasses}
        onClick={onOptionSelect}
      >
        {children}
      </Panel>
    </div>
  );
}

export default CatalogPackageOption;
