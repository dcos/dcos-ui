import * as React from "react";
import { Select, SelectOption } from "reactjs-components";
import VolumeDefinitions from "../constants/VolumeDefinitions";
import { Trans } from "@lingui/react";

export const VolumeSelect = ({
  prefix = "volumes",
  volume,
  index,
  exclude = ["EPHEMERAL", "DSS"],
}) => (
  <Select
    name={`${prefix}.${index}.type`}
    value={volume.type}
    placeholder="Select ..."
  >
    {Object.keys(VolumeDefinitions)
      .filter((type) => !exclude.includes(type))
      .map(toOption)}
  </Select>
);

const recommended = (
  <Trans className="dropdown-select-item-title__badge badge" id="Recommended" />
);

export const toOption = (type: string) => (
  <SelectOption
    key={type}
    value={type}
    label={<Trans id={VolumeDefinitions[type].name} />}
  >
    <div className="dropdown-select-item-title">
      <Trans id={VolumeDefinitions[type].name} />
      {VolumeDefinitions[type].recommended ? recommended : null}
    </div>
    <Trans
      id={VolumeDefinitions[type].description}
      className="dropdown-select-item-description"
    />
  </SelectOption>
);
