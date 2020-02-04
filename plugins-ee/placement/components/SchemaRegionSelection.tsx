import * as React from "react";

import RegionSelection from "./RegionSelection";

export default class SchemaRegionSelection extends React.Component {
  render() {
    const { name, formData, onChange, onBlur, onFocus } = this.props.fieldProps;

    const selectProps = {
      name,
      type: "text",
      value: formData,
      onChange: event => onChange(event.target.value),
      onBlur: onBlur && (event => onBlur(name, event.target.value)),
      onFocus: onFocus && (event => onFocus(name, event.target.value))
    };

    return <RegionSelection selectProps={selectProps} />;
  }
}
