import * as React from "react";

import RegionSelection from "./RegionSelection";

class PlacementRegionSelection extends React.Component {
  render() {
    const { constraint = { value: "" }, index } = this.props.data;

    const selectProps = {
      name: `constraints.${index}.region`,
      type: "text",
      value: constraint.value,
    };

    return <RegionSelection selectProps={selectProps} />;
  }
}

export default PlacementRegionSelection;
