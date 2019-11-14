import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

import ConfigurationMap from "../../../components/ConfigurationMap";
import ConfigurationMapLabel from "../../../components/ConfigurationMapLabel";
import ConfigurationMapRow from "../../../components/ConfigurationMapRow";
import ConfigurationMapSection from "../../../components/ConfigurationMapSection";
import ConfigurationMapValue from "../../../components/ConfigurationMapValue";
import Overlay from "../../../structs/Overlay";

const VirtualNetworkDetailsTab = props => {
  const { overlay } = props;

  return (
    <div className="container">
      <ConfigurationMap>
        <ConfigurationMapSection>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans render="span">Name</Trans>
            </ConfigurationMapLabel>
            <ConfigurationMapValue>{overlay.getName()}</ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              <Trans render="span">IP Subnet</Trans>
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {overlay.getSubnet() || overlay.getSubnet6()}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        </ConfigurationMapSection>
      </ConfigurationMap>
    </div>
  );
};

VirtualNetworkDetailsTab.propTypes = {
  overlay: PropTypes.instanceOf(Overlay)
};

module.exports = VirtualNetworkDetailsTab;
