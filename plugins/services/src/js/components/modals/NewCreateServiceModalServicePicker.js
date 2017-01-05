import {Hooks} from 'PluginSDK';
import {MountService} from 'foundation-ui';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';

import CreateServiceModalServicePickerOption from '../../../../../../src/js/components/CreateServiceModalServicePickerOption';
import CreateServiceModalServicePickerOptionWrapper from '../../../../../../src/js/components/CreateServiceModalServicePickerOptionWrapper';
import defaultServiceImage from '../../../img/icon-service-default-large@2x.png';
import Image from '../../../../../../src/js/components/Image';
import jsonServiceImage from '../../../img/service-image-json-large@2x.png';

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
    const containerClasses = Hooks.applyFilter(
      'servicePickerOptionContainerColumnClasses',
      'column-12 column-medium-10 column-medium-offset-1'
    );

    return (
      <div className="create-service-modal-service-picker container">
        <div className="create-service-modal-service-picker-options">
          <div className="row">
            <div className={containerClasses}>
              <div className="row panel-grid">
                <CreateServiceModalServicePickerOptionWrapper>
                  <CreateServiceModalServicePickerOption
                    icon={<Image src={defaultServiceImage} />}
                    offset={true}
                    onOptionSelect={
                      this.handleServiceSelect.bind(null, {type: 'app'})
                    }
                    title="Single Container" />
                </CreateServiceModalServicePickerOptionWrapper>
                <CreateServiceModalServicePickerOptionWrapper>
                  <CreateServiceModalServicePickerOption
                    icon={<Image src={defaultServiceImage} />}
                    onOptionSelect={
                      this.handleServiceSelect.bind(null, {type: 'pod'})
                    }
                    title="Multi-container (Pod)"
                    />
                </CreateServiceModalServicePickerOptionWrapper>
                <CreateServiceModalServicePickerOptionWrapper>
                  <CreateServiceModalServicePickerOption
                    icon={<Image src={jsonServiceImage} />}
                    onOptionSelect={
                      this.handleServiceSelect.bind(null, {type: 'json'})
                    }
                    title="JSON Configuration" />
                </CreateServiceModalServicePickerOptionWrapper>
                <MountService.Mount
                  type="CreateService:ServicePicker:GridOptions"
                  onOptionSelect={this.handleServiceSelect}
                  redirect={(route) => this.props.router.push(route)} />
              </div>
            </div>
          </div>
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
