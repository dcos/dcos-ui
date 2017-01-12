import React from 'react';

import CreateServiceModalServicePickerOption from '../../components/CreateServiceModalServicePickerOption';
import Icon from '../../components/Icon';

function CreateServicePickerUniverseOption({redirect}) {
  return (
    <CreateServiceModalServicePickerOption
      icon={(
        <div className="icon icon-jumbo icon-image-container icon-app-container icon-background-neutral">
          <Icon id="packages-inverse" size="large" family="product" color="white" />
        </div>
      )}
      onOptionSelect={function () {
        redirect('universe');
      }}
      title="Install a Package" />
  );
}

module.exports = CreateServicePickerUniverseOption;
