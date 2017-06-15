import React from "react";

import packageServiceImage
  from "../../img/service-picker-options/service-image-package-large@2x.png";
import CreateServiceModalServicePickerOption
  from "./CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent
  from "./CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage
  from "./CreateServiceModalServicePickerOptionImage";

class CreateServicePickerUniverseOption extends React.Component {
  render() {
    const { columnClasses, onOptionSelect } = this.props;

    return (
      <CreateServiceModalServicePickerOption
        columnClasses={columnClasses}
        onOptionSelect={onOptionSelect.bind(null, {
          route: "universe",
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

CreateServicePickerUniverseOption.propTypes = {
  columnClasses: React.PropTypes.string,
  onOptionSelect: React.PropTypes.func
};

module.exports = CreateServicePickerUniverseOption;
