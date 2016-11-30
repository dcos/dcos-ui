import React from 'react';

import BooleanValue from '../components/ConfigurationMapBooleanValue';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

const BOOLEAN_OPTIONS = {
  truthy : 'TRUE',
  falsy  : 'FALSE'
};

module.exports = ({appConfig}) => {
  let volumes = (appConfig.volumes || []).reduce((memo, volume) => {
    let volumeInfo = {
      volume: volume.name,
      host: volume.host
    };

    // Fetch all mounts for this volume in the containers
    let containerMounts = (appConfig.containers || []).reduce(
      (cmMemo, container) => {
        let {volumeMounts=[]} = container;
        return cmMemo.concat(
          volumeMounts
            .filter((volumeMount) => volumeMount.name === volume.name)
            .map((volumeMount) => {
              return {
                container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container),
                mountPath: volumeMount.mountPath,
                readOnly: volumeMount.readOnly || false
              };
            })
        );
      },
      []
    );

    // If threre are no mounts, add only one line without containers
    if (containerMounts.length === 0) {
      memo.push(volumeInfo);
      return memo;
    }

    // Otherwise create one volume entry for each mount
    return containerMounts.reduce((volumesMemo, mountInfo) => {
      return volumesMemo.concat(
        Object.assign(volumeInfo, mountInfo)
      );
    }, memo);
  }, []);

  if (!volumes.length) {
    return null;
  }

  return (
    <div>
      <Heading level={1}>Storage</Heading>
      <Section key="pod-general-section">

        <ConfigurationMapTable
          className="table table-simple table-break-word flush-bottom"
          columnDefaults={{
            hideIfEmpty: true
          }}
          columns={[
            {
              heading: 'Volume',
              prop: 'volume'
            },
            {
              heading: 'Size',
              prop: 'size'
            },
            {
              heading: 'Read Only',
              prop: 'readOnly',
              render(prop, row) {
                return (
                  <BooleanValue
                    options={BOOLEAN_OPTIONS}
                    value={row[prop]} />
                );
              }
            },
            {
              heading: 'Container Mount Path',
              prop: 'mountPath'
            },
            {
              heading: 'Container',
              prop: 'container'
            }
          ]}
          data={volumes} />

      </Section>
    </div>
  );
};
