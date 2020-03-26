import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";

import * as React from "react";

import { Select, SelectOption } from "reactjs-components";

import VolumeDefinitions from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

const excludedTypesSingleContainer = ["EPHEMERAL"];
function mapOptions(type, index) {
  return (
    <SelectOption key={index} value={type} label={VolumeDefinitions[type].name}>
      <div className="dropdown-select-item-title">
        <Trans render="span" id={VolumeDefinitions[type].name} />
        {VolumeDefinitions[type].recommended ? (
          <Trans
            render="span"
            className="dropdown-select-item-title__badge badge"
          >
            Recommended
          </Trans>
        ) : null}
      </div>
      <span className="dropdown-select-item-description">
        {VolumeDefinitions[type].description}
      </span>
    </SelectOption>
  );
}

function VolumeTypeSelect(props) {
  const { volume, index, i18n } = props;

  return (
    <Select
      name={`volumes.${index}.type`}
      value={volume.type}
      placeholder={i18n._(t`Select ...`)}
    >
      {Object.keys(VolumeDefinitions)
        .filter((type) => !excludedTypesSingleContainer.includes(type))
        .map(mapOptions)}
    </Select>
  );
}

export default withI18n()(VolumeTypeSelect);
