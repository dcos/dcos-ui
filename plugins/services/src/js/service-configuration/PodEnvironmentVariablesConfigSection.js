import PropTypes from "prop-types";
import React from "react";
import { MountService } from "foundation-ui";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";

import {
  getSharedIconWithLabel,
  getContainerNameWithIcon
} from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapTable from "../components/ConfigurationMapTable";

const columns = [
  {
    heading: "Key",
    prop: "key"
  },
  {
    heading: "Value",
    prop: "value"
  },
  {
    heading: "Container",
    prop: "container"
  }
];

const PodEnvironmentVariablesConfigSection = ({ appConfig, onEditClick }) => {
  const { environment = {}, containers = [] } = appConfig;

  if (!environment || !containers) {
    return <noscript />;
  }

  let combinedEnv = Object.keys(environment)
    .filter(function(key) {
      return typeof environment[key] === "string";
    })
    .reduce((memo, key) => {
      memo.push({
        key: <code>{key}</code>,
        value: environment[key],
        container: getSharedIconWithLabel()
      });

      return memo;
    }, []);

  combinedEnv = containers.reduce((memo, container) => {
    const { environment = {} } = container;

    return Object.keys(environment).reduce((cvMemo, key) => {
      cvMemo.push({
        key: <code>{key}</code>,
        value: environment[key],
        container: getContainerNameWithIcon(container)
      });

      return cvMemo;
    }, memo);
  }, combinedEnv);

  if (!combinedEnv.length) {
    return <noscript />;
  }

  return (
    <div>
      <ConfigurationMapHeading level={1}>
        Environment Variables
      </ConfigurationMapHeading>
      <ConfigurationMapSection key="pod-general-section">
        <MountService.Mount
          type="CreateService:ServiceConfigDisplay:Pod:EnvironmentVariables"
          appConfig={appConfig}
          onEditClick={onEditClick}
        >
          <ConfigurationMapTable
            columnDefaults={{ hideIfEmpty: true }}
            columns={columns}
            data={combinedEnv}
            onEditClick={onEditClick}
            tabViewID="multienvironment"
          />
        </MountService.Mount>
      </ConfigurationMapSection>
    </div>
  );
};

PodEnvironmentVariablesConfigSection.propTypes = {
  onEditClick: PropTypes.func
};

module.exports = PodEnvironmentVariablesConfigSection;
