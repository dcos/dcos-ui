import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";

import * as React from "react";

import { Select, SelectOption } from "reactjs-components";

import VolumeDefinitions from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

const excludedTypesMultiContainer = ["EXTERNAL"];
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
      <Trans render="span" className="dropdown-select-item-description">
        {VolumeDefinitions[type].description}
      </Trans>
    </SelectOption>
  );
}

function VolumeMountTypesSelect(props) {
  const { volumes, index, i18n } = props;

  return (
    <Select
      name={`volumeMounts.${index}.type`}
      value={volumes.type}
      placeholder={i18n._(t`Select ...`)}
    >
      {Object.keys(VolumeDefinitions)
        .filter(type => !excludedTypesMultiContainer.includes(type))
        .map(mapOptions)}
    </Select>
  );
}

export default withI18n()(VolumeMountTypesSelect);
