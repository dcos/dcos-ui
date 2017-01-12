import React from 'react';

function ServicePickerOptionWrapper({children}) {
  return (
    <div className="create-service-modal-service-picker-option panel-grid-item column-12 column-small-6">
      {children}
    </div>
  );
}

module.exports = ServicePickerOptionWrapper;
