import React from "react";
import { FormattedMessage } from "react-intl";
import moment from "moment";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";

function timeFromNow(time) {
  if (!time) {
    return null;
  }

  return moment(time * 1000).fromNow();
}

const Loading = () => <Loader size="small" type="ballBeat" />;

const ConfigurationRow = ({ keyValue, title, value }) => {
  const loadedValue = value || <Loading />;

  return (
    <ConfigurationMapRow key={keyValue}>
      <ConfigurationMapLabel>{title}</ConfigurationMapLabel>
      <ConfigurationMapValue>{loadedValue}</ConfigurationMapValue>
    </ConfigurationMapRow>
  );
};

export default function LeaderGrid({ leader }) {
  return (
    <div className="container">
      <ConfigurationMap>
        <ConfigurationMapHeading className="flush-top">
          Leader
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <ConfigurationRow
            keyValue="leader"
            title="IP and Port"
            value={leader.hostPort}
          />

          <ConfigurationRow
            keyValue="region"
            title="Region"
            value={leader.region}
          />

          <ConfigurationRow
            keyValue="version"
            title={<FormattedMessage id="COMMON.VERSION" />}
            value={leader.version}
          />

          <ConfigurationRow
            keyValue="started"
            title={<FormattedMessage id="COMMON.STARTED" />}
            value={timeFromNow(leader.startTime)}
          />

          <ConfigurationRow
            keyValue="elected"
            title={<FormattedMessage id="COMMON.ELECTED" />}
            value={timeFromNow(leader.electedTime)}
          />
        </ConfigurationMapSection>
      </ConfigurationMap>
    </div>
  );
}
