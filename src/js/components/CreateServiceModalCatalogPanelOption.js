/* @flow */
import React from "react";

import packageServiceImage
  from "../../img/service-picker-options/service-image-package-large@2x.png";
import CreateServiceModalServicePickerOption
  from "./CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent
  from "./CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage
  from "./CreateServiceModalServicePickerOptionImage";

type Props = {
  columnClasses?: string,
  onOptionSelect?: Function
};

class CreateServicePickerCatalogOption extends React.Component {

  render() {
    const { columnClasses, onOptionSelect } = this.props;

    return (
      <CreateServiceModalServicePickerOption
        columnClasses={columnClasses}
        onOptionSelect={onOptionSelect.bind(null, {
          route: "catalog",
          type: "redirect"
        })}
      >
        <CreateServiceModalServicePickerOptionImage src={packageServiceImage} />
        <CreateServiceModalServicePickerOptionContent>
          Install a Package
        </CreateServiceModalServicePickerOptionContent>
      </CreateServiceModalServicePickerOption>
    );
  }
}

module.exports = CreateServicePickerCatalogOption;
