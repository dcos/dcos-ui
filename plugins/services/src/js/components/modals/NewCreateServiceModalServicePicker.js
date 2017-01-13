import {MountService} from 'foundation-ui';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';

import defaultServiceImage from '../../../img/icon-service-default-medium@2x.png';
import jsonServiceImage from '../../../img/service-image-json-medium@2x.png';
import CreateServiceModalServicePickerOption from '../../../../../../src/js/components/CreateServiceModalServicePickerOption';
import CreateServiceModalServicePickerOptionWrapper from '../../../../../../src/js/components/CreateServiceModalServicePickerOptionWrapper';
import Image from '../../../../../../src/js/components/Image';

const METHODS_TO_BIND = ['handleServiceSelect'];

class NewCreateServiceModalServicePicker extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleServiceSelect(service) {
    this.props.onServiceSelect(service);
  }

  render() {
    return (
      <div className="create-service-modal-service-picker container">
        <div className="create-service-modal-service-picker-options panel-grid row">
          <CreateServiceModalServicePickerOptionWrapper>
            <CreateServiceModalServicePickerOption
              icon={(
                <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
                  <Image fallbackSrc={defaultServiceImage}
                    src={defaultServiceImage} />
                </div>
              )}
              offset={true}
              onOptionSelect={
                this.handleServiceSelect.bind(null, {type: 'app'})
              }
              title="Single Container" />
          </CreateServiceModalServicePickerOptionWrapper>
          <CreateServiceModalServicePickerOptionWrapper>
            <CreateServiceModalServicePickerOption
              icon={(
                <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
                  <Image fallbackSrc={defaultServiceImage}
                    src={defaultServiceImage} />
                </div>
              )}
              onOptionSelect={
                this.handleServiceSelect.bind(null, {type: 'pod'})
              }
              title="Multi-container (Pod)"
              />
          </CreateServiceModalServicePickerOptionWrapper>
          <CreateServiceModalServicePickerOptionWrapper>
            <CreateServiceModalServicePickerOption
              icon={(
                <div className="icon icon-jumbo icon-image-container icon-app-container icon-default-white">
                  <Image fallbackSrc={defaultServiceImage}
                    src={jsonServiceImage} />
                </div>
              )}
              onOptionSelect={
                this.handleServiceSelect.bind(null, {type: 'json'})
              }
              title="JSON Configuration" />
          </CreateServiceModalServicePickerOptionWrapper>
          <MountService.Mount
            type="CreateService:ServicePicker:GridOptions"
            onOptionSelect={this.handleServiceSelect}
            redirect={(route) => this.props.router.push(route)}
            wrapper={CreateServiceModalServicePickerOptionWrapper} />
        </div>
      </div>
    );
  }
}

NewCreateServiceModalServicePicker.propTypes = {
  onServiceSelect: React.PropTypes.func,
  router: routerShape
};

module.exports = NewCreateServiceModalServicePicker;
