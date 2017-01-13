import {Hooks} from 'PluginSDK';
import {MountService} from 'foundation-ui';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {routerShape} from 'react-router';

import CreateServiceModalServicePickerOption from '../../../../../../src/js/components/CreateServiceModalServicePickerOption';
import CreateServiceModalServicePickerOptionContent from '../../../../../../src/js/components/CreateServiceModalServicePickerOptionContent';
import CreateServiceModalServicePickerOptionImage from '../../../../../../src/js/components/CreateServiceModalServicePickerOptionImage';
import defaultServiceImage from '../../../img/icon-service-default-large@2x.png';
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
                <CreateServiceModalServicePickerOption
                  onOptionSelect={
                    this.handleServiceSelect.bind(null, {type: 'app'})
                  }>
                  <CreateServiceModalServicePickerOptionImage
                    src={defaultServiceImage} />
                  <CreateServiceModalServicePickerOptionContent>
                    Single Container
                  </CreateServiceModalServicePickerOptionContent>
                </CreateServiceModalServicePickerOption>

                <CreateServiceModalServicePickerOption
                  onOptionSelect={
                    this.handleServiceSelect.bind(null, {type: 'pod'})
                  }>
                  <CreateServiceModalServicePickerOptionImage
                    src={defaultServiceImage} />
                  <CreateServiceModalServicePickerOptionContent>
                    Multi-container (Pod)
                  </CreateServiceModalServicePickerOptionContent>
                </CreateServiceModalServicePickerOption>

                <CreateServiceModalServicePickerOption
                  onOptionSelect={
                    this.handleServiceSelect.bind(null, {type: 'json'})
                  }>
                  <CreateServiceModalServicePickerOptionImage
                    src={jsonServiceImage} />
                  <CreateServiceModalServicePickerOptionContent>
                    JSON Configuration
                  </CreateServiceModalServicePickerOptionContent>
                </CreateServiceModalServicePickerOption>

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
