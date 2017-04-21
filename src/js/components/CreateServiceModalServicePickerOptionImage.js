import React from "react";

import Image from "./Image";

function CreateServiceModalServicePickerOptionImage(props) {
  return (
    <div className="icon icon-jumbo icon-image-container icon-app-container">
      <Image {...props} />
    </div>
  );
}

module.exports = CreateServiceModalServicePickerOptionImage;
