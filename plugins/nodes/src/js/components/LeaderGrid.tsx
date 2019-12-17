import { Trans, DateFormat } from "@lingui/macro";
import * as React from "react";
import { ToggleContent } from "@dcos/ui-kit";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import DateUtil from "#SRC/js/utils/DateUtil";

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
          <Trans id="Leader" />
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <ConfigurationRow
            keyValue="leader"
            title={<Trans id="IP and Port" />}
            value={leader.hostPort}
          />

          <ConfigurationRow
            keyValue="region"
            title={<Trans id="Region" />}
            value={leader.region}
          />

          <ConfigurationRow
            keyValue="version"
            title={<Trans id="Mesos Version" />}
            value={leader.version}
          />

          {/* L10NTODO: Relative time */}
          <ConfigurationRow
            keyValue="started"
            title={<Trans id="Started" />}
            value={
              <ToggleContent
                contentOn={DateUtil.msToRelativeTime(leader.startTime * 1000)}
                contentOff={
                  <DateFormat
                    value={new Date(leader.startTime * 1000)}
                    format={DateUtil.getFormatOptions("longMonthDateTime")}
                  />
                }
              />
            }
          />

          {/* L10NTODO: Relative time */}
          <ConfigurationRow
            keyValue="elected"
            title={<Trans id="Elected" />}
            value={
              <ToggleContent
                contentOn={DateUtil.msToRelativeTime(leader.electedTime * 1000)}
                contentOff={
                  <DateFormat
                    value={new Date(leader.electedTime * 1000)}
                    format={DateUtil.getFormatOptions("longMonthDateTime")}
                  />
                }
              />
            }
          />
        </ConfigurationMapSection>
      </ConfigurationMap>
    </div>
  );
}
