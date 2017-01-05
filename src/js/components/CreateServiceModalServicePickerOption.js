import React from 'react';

import Panel from './Panel';

function CreateServiceModalServicePickerOption({icon, title, onOptionSelect}) {
  return (
    <Panel className="panel-interactive clickable"
      contentClass={[
        'horizontal-center panel-cell flush-top',
        {
          'panel-cell-short': false,
          'panel-cell-shorter': false
        }
      ]}
      heading={(
        <div className="icon icon-jumbo icon-image-container icon-app-container">
          {icon}
        </div>
      )}
      headingClass={[
        'panel-cell-borderless horizontal-center panel-cell',
        {
          'panel-cell-light': false,
          'panel-cell-shorter': false
        }
      ]}
      onClick={onOptionSelect}>
      <h5 className="flush text-align-center">
        {title}
      </h5>
    </Panel>
  );
}

module.exports = CreateServiceModalServicePickerOption;
