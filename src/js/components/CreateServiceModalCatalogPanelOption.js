import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

import packageServiceImage from "../../img/service-picker-options/service-image-package-large@2x.png";
import CreateServiceModalServicePickerOption from "./CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent from "./CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage from "./CreateServiceModalServicePickerOptionImage";

class CreateServicePickerCatalogOption extends React.Component {
  render() {
    const { columnClasses, onOptionSelect } = this.props;

    return (
      <CreateServiceModalServicePickerOption
        columnClasses={columnClasses}
        onOptionSelect={onOptionSelect.bind(null, {
          route: "/catalog",
          type: "redirect"
        })}
      >
        <CreateServiceModalServicePickerOptionImage src={packageServiceImage} />
        <CreateServiceModalServicePickerOptionContent>
          <Trans render="span">Install a Package</Trans>
        </CreateServiceModalServicePickerOptionContent>
      </CreateServiceModalServicePickerOption>
    );
  }
}

CreateServicePickerCatalogOption.propTypes = {
  columnClasses: PropTypes.string,
  onOptionSelect: PropTypes.func
};

export default CreateServicePickerCatalogOption;
