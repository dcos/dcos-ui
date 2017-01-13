import {Hooks} from 'PluginSDK';
import React from 'react';

import CreateServiceModalServicePickerOptionContent from './CreateServiceModalServicePickerOptionContent';
import CreateServiceModalServicePickerOptionImage from './CreateServiceModalServicePickerOptionImage';
import Panel from './Panel';

function getChildOfType(children, type) {
  return React.Children.toArray(children).filter(
    (child) => child.type === type
  );
}

function CreateServiceModalServicePickerOption({children, onOptionSelect}) {
  const columnClass = Hooks.applyFilter(
    'servicePickerOptionColumnClasses', 'column-12 column-small-4'
  );

  return (
    <div className={`create-service-modal-service-picker-option panel-grid-item ${columnClass}`}>
      <Panel className="panel-interactive clickable"
        contentClass={[
          'horizontal-center panel-cell flush-top',
          {
            'panel-cell-short': false,
            'panel-cell-shorter': false
          }
        ]}
        heading={
          getChildOfType(children, CreateServiceModalServicePickerOptionImage)
        }
        headingClass={[
          'panel-cell-borderless horizontal-center panel-cell',
          {
            'panel-cell-light': false,
            'panel-cell-shorter': false
          }
        ]}
        onClick={onOptionSelect}>
        {getChildOfType(children, CreateServiceModalServicePickerOptionContent)}
      </Panel>
    </div>
  );
}

module.exports = CreateServiceModalServicePickerOption;
