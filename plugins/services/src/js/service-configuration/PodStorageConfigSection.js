import React from 'react';

import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';

module.exports = ({appConfig}) => {
  let volumes = (appConfig.volumes || []).reduce((memo, volume) => {
    let volumeInfo = {
      volume: volume.name,
      host: volume.host
    };

    // Fetch all mounts for this volume in the containers
    let containerMounts = (appConfig.containers || []).reduce(
      (cmMemo, container) => {
        return (container.volumeMounts || []).reduce((cmMemo, volumeMount) => {
          if (volumeMount.name === volume.name) {
            cmMemo.push({
              container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container),
              mountPath: volumeMount.mountPath,
              readOnly: volumeMount.readOnly || false
            });
          }
          return cmMemo;
        }, cmMemo);
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
              prop: 'readOnly'
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
