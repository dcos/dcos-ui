import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import CreateServiceModalServicePickerOption
  from "#SRC/js/components/CreateServiceModalServicePickerOption";
import CreateServiceModalServicePickerOptionContent
  from "#SRC/js/components/CreateServiceModalServicePickerOptionContent";
import CreateServiceModalServicePickerOptionImage
  from "#SRC/js/components/CreateServiceModalServicePickerOptionImage";
import CreateServiceModalServicePickerOptionWrapper
  from "#SRC/js/components/CreateServiceModalServicePickerOptionWrapper";
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

const OPTIONS = [JSONOption, MultiContainerOption, SingleContainerOption];

class CreateServiceModalServicePicker extends React.Component {
  componentDidMount() {
    OPTIONS.forEach(function(component, index) {
      MountService.MountService.registerComponent(
        component,
        "CreateService:ServicePicker:GridOptions",
        index + 1
      );
    });
  }

  componentWillUnmount() {
    OPTIONS.forEach(function(component) {
      MountService.MountService.unregisterComponent(
        component,
        "CreateService:ServicePicker:GridOptions"
      );
    });
  }

  render() {
    return (
      <div className="create-service-modal-service-picker container">
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

CreateServiceModalServicePicker.propTypes = {
  onServiceSelect: React.PropTypes.func
};

module.exports = CreateServiceModalServicePicker;
