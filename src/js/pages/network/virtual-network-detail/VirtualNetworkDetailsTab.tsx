import { Trans } from "@lingui/react";
import * as React from "react";

import ConfigurationMap from "../../../components/ConfigurationMap";
import ConfigurationMapLabel from "../../../components/ConfigurationMapLabel";
import ConfigurationMapRow from "../../../components/ConfigurationMapRow";
import ConfigurationMapSection from "../../../components/ConfigurationMapSection";
import ConfigurationMapValue from "../../../components/ConfigurationMapValue";
import { Overlay } from "../../../structs/Overlay";

export default ({ overlay }: { overlay: Overlay }) => (
  <div className="container">
    <ConfigurationMap>
      <ConfigurationMapSection>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span" id="Name" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{overlay.name}</ConfigurationMapValue>
        </ConfigurationMapRow>

        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render="span" id="IP Subnet" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {overlay.subnet || overlay.subnet6}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    </ConfigurationMap>
  </div>
);
