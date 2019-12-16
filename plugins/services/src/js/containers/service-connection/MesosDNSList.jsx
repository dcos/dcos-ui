import React from "react";
import { Trans } from "@lingui/macro";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import EndpointClipboardTrigger from "./EndpointClipboardTrigger";
import Pod from "../../structs/Pod";

const MesosDNSList = props => {
  const { service } = props;
  const servicesByFramework = MesosStateStore.getTasksByService(service)
    .filter(task => task.state === "TASK_RUNNING")
    .reduce(
      (acc, task) => ({
        ...acc,
        [MesosStateStore.getFrameworkByTask(task).name]: {
          ...acc[MesosStateStore.getFrameworkByTask(task).name],
          [service instanceof Pod ? service.getName() : task.name]: true
        }
      }),
      {}
    );
  if (Object.keys(servicesByFramework).length === 0) {
    return null;
  }
  return (
    <ConfigurationMapSection>
      <ConfigurationMapHeading>
        <Trans>Mesos DNS</Trans>
      </ConfigurationMapHeading>
      {[].concat(
        Object.keys(servicesByFramework).map(framework =>
          Object.keys(servicesByFramework[framework]).map(service => (
            <ConfigurationMapRow>
              <ConfigurationMapLabel>{framework}</ConfigurationMapLabel>
              <ConfigurationMapValue>
                <EndpointClipboardTrigger
                  command={`${service}.${framework}.mesos`}
                />
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          ))
        )
      )}
    </ConfigurationMapSection>
  );
};

export default MesosDNSList;
