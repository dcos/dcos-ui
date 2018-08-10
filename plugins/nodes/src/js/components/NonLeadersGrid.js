import React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import StringUtil from "../../../../../src/js/utils/StringUtil";

const Loading = () => <Loader size="small" type="ballBeat" />;

const ConfigurationRow = ({ keyValue, title, value }) => {
  return (
    <ConfigurationMapRow key={keyValue}>
      <ConfigurationMapLabel>{title}</ConfigurationMapLabel>
      <ConfigurationMapValue>
        <span className={value.classNames}>
          {StringUtil.capitalize(value.title)}
        </span>
      </ConfigurationMapValue>
    </ConfigurationMapRow>
  );
};

const NonLeader = ({ master }) => {
  return (
    <ConfigurationRow
      keyValue={master.host_ip}
      title={master.host_ip}
      value={master.healthDescription}
    />
  );
};

const EmptyLeaderList = () => {
  return <div>There are no more known masters in this cluster</div>;
};

const NonLeaderList = ({ masters }) => {
  if (masters.length === 0) {
    return <EmptyLeaderList />;
  }

  return (
    <ConfigurationMapSection>
      {masters.map(master => (
        <NonLeader key={master.host_ip} master={master} />
      ))}
    </ConfigurationMapSection>
  );
};

export default function NonLeaderGrid({ masters }) {
  const hasMasters = Array.isArray(masters);
  const content = hasMasters ? (
    <NonLeaderList masters={masters} />
  ) : (
    <Loading />
  );

  return (
    <div className="container">
      <ConfigurationMap>
        <ConfigurationMapHeading className="flush-top">
          Non-Leaders
        </ConfigurationMapHeading>
        {content}
      </ConfigurationMap>
    </div>
  );
}
