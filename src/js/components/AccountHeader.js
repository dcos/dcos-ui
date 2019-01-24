import { MountService } from "foundation-ui";
import React from "react";

export default function AccountHeader(props) {
  return (
    <MountService.Mount
      type="Header:UserAccountDropdown"
      limit={1}
      onUpdate={props.onUpdate}
    />
  );
}
