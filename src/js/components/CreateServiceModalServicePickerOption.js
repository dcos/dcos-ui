import React from "react";

import CreateServiceModalServicePickerOptionContent
  from "./CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage
  from "./CreateServiceModalServicePickerOptionImage";
import Panel from "./Panel";

function getChildOfType(children, type) {
  return React.Children.toArray(children).filter(child => child.type === type);
}

function CreateServiceModalServicePickerOption({
  children,
  columnClasses,
  onOptionSelect
}) {
  const contentClasses = [
    "horizontal-center panel-cell flush-top",
    {
      "panel-cell-short": false,
      "panel-cell-shorter": false
    }
  ];
  const headingClasses = [
    "panel-cell-borderless horizontal-center panel-cell",
    {
      "panel-cell-light": false,
      "panel-cell-shorter": false
    }
  ];

  return (
    <div
      className={`create-service-modal-service-picker-option panel-grid-item ${columnClasses}`}
    >
      <Panel
        className="panel-interactive clickable"
        contentClass={contentClasses}
        heading={getChildOfType(
          children,
          CreateServiceModalServicePickerOptionImage
        )}
        headingClass={headingClasses}
        onClick={onOptionSelect}
      >
        {getChildOfType(children, CreateServiceModalServicePickerOptionContent)}
      </Panel>
    </div>
  );
}

module.exports = CreateServiceModalServicePickerOption;
