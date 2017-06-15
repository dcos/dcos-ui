import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import CreateServiceModalServicePickerOption
  from "../../../../../../src/js/components/CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent
  from "../../../../../../src/js/components/CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage
  from "../../../../../../src/js/components/CreateServiceModalServicePickerOptionImage";
import CreateServiceModalServicePickerOptionWrapper
  from "../../../../../../src/js/components/CreateServiceModalServicePickerOptionWrapper";
import defaultServiceImage
  from "../../../img/icon-service-default-large@2x.png";
import jsonServiceImage from "../../../img/service-image-json-large@2x.png";

function SingleContainerOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "app" })}
    >
      <CreateServiceModalServicePickerOptionImage src={defaultServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        Single Container
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

function MultiContainerOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "pod" })}
    >
      <CreateServiceModalServicePickerOptionImage src={defaultServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        Multi-container (Pod)
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

function JSONOption({ columnClasses, onOptionSelect }) {
  return (
    <CreateServiceModalServicePickerOption
      columnClasses={columnClasses}
      onOptionSelect={onOptionSelect.bind(null, { type: "json" })}
    >
      <CreateServiceModalServicePickerOptionImage src={jsonServiceImage} />
      <CreateServiceModalServicePickerOptionContent>
        JSON Configuration
      </CreateServiceModalServicePickerOptionContent>
    </CreateServiceModalServicePickerOption>
  );
}

class NewCreateServiceModalServicePicker extends React.Component {
  constructor() {
    super(...arguments);

    MountService.MountService.registerComponent(
      SingleContainerOption,
      "CreateService:ServicePicker:GridOptions",
      3
    );

    MountService.MountService.registerComponent(
      MultiContainerOption,
      "CreateService:ServicePicker:GridOptions",
      2
    );

    MountService.MountService.registerComponent(
      JSONOption,
      "CreateService:ServicePicker:GridOptions",
      1
    );
  }

  render() {
    return (
      <div className="create-service-modal-service-picker container container-wide">
        <div className="create-service-modal-service-picker-options">
          <div className="row">
            <MountService.Mount
              alwaysWrap={true}
              onOptionSelect={this.props.onServiceSelect}
              type="CreateService:ServicePicker:GridOptions"
              wrapper={CreateServiceModalServicePickerOptionWrapper}
            />
          </div>
        </div>
      </div>
    );
  }
}

NewCreateServiceModalServicePicker.propTypes = {
  onServiceSelect: React.PropTypes.func
};

module.exports = NewCreateServiceModalServicePicker;
