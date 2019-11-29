import React from "react";

import Image from "./Image";

function CreateServiceModalServicePickerOptionImage(props) {
  return (
    <div className="icon icon-huge icon-image-container icon-app-container">
      <Image {...props} />
    </div>
  );
}

export default CreateServiceModalServicePickerOptionImage;
