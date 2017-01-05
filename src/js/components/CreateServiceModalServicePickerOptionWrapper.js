import {Hooks} from 'PluginSDK';
import React from 'react';

function ServicePickerOptionWrapper({children}) {
  const columnClass = Hooks.applyFilter(
    'servicePickerOptionColumnClasses', 'column-12 column-small-4'
  );

  return (
    <div className={`create-service-modal-service-picker-option panel-grid-item ${columnClass}`}>
      {children}
    </div>
  );
}

module.exports = ServicePickerOptionWrapper;
