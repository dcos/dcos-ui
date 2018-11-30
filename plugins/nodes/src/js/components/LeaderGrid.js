import { Trans, DateFormat } from "@lingui/macro";
import React from "react";
import { ToggleContent } from "@dcos/ui-kit";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import { msToRelativeTime } from "#SRC/js/utils/DateUtil";

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
          <Trans render="span">Leader</Trans>
        </ConfigurationMapHeading>
        <ConfigurationMapSection>
          <ConfigurationRow
            keyValue="leader"
            title={<Trans render="span">IP and Port</Trans>}
            value={leader.hostPort}
          />

          <ConfigurationRow
            keyValue="region"
            title={<Trans render="span">Region</Trans>}
            value={leader.region}
          />

          <ConfigurationRow
            keyValue="version"
            title={<Trans render="span">Mesos Version</Trans>}
            value={leader.version}
          />

          {/* L10NTODO: Relative time */}
          <ConfigurationRow
            keyValue="started"
            title={<Trans render="span">Started</Trans>}
            value={
              <ToggleContent
                contentOn={msToRelativeTime(leader.startTime * 1000)}
                contentOff={
                  <DateFormat
                    value={new Date(leader.startTime * 1000)}
                    format={{
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    }}
                  />
                }
              />
            }
          />

          {/* L10NTODO: Relative time */}
          <ConfigurationRow
            keyValue="elected"
            title={<Trans render="span">Elected</Trans>}
            value={
              <ToggleContent
                contentOn={msToRelativeTime(leader.electedTime * 1000)}
                contentOff={
                  <DateFormat
                    value={new Date(leader.electedTime * 1000)}
                    format={{
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    }}
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
