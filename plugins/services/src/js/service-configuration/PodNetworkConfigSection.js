import React from 'react';

import ConfigurationMapTable from '../components/ConfigurationMapTable';
import Heading from '../../../../../src/js/components/ConfigurationMapHeading';
import Label from '../../../../../src/js/components/ConfigurationMapLabel';
import Row from '../../../../../src/js/components/ConfigurationMapRow';
import Section from '../../../../../src/js/components/ConfigurationMapSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import ValueWithDefault from '../components/ConfigurationMapValueWithDefault';

const NETWORK_MODE_NAME = {
  'container': 'Contaienr',
  'host': 'Host'
};

function getNetworkTypes(networks) {
  if (!networks || !networks.length) {
    return null;
  }

  return networks
    .map(({mode}) => NETWORK_MODE_NAME[mode])
    .join(', ');
}

function getLoadBalancerType() {
  // TODO: How is this determined?
  return null;
}

function getExtLoadBalancerType() {
  // TODO: How is this determined?
  return null;
}

module.exports = ({appConfig}) => {
  let {containers=[]} = appConfig;
  let endpoints = containers.reduce((memo, container) => {
    return memo.concat(
      (container.endpoints || []).map(({containerPort, labels={}, name, protocol}) => {
        let lbAddress = Object.keys(labels).reduce((memo, label) => {
          if (label.startsWith('VIP_')) {
            let [prefix, port] = labels[label].split(':');
            memo.push(`${prefix}.marathon.lb4lb.thisdcos.directory:${port}`);
          }
          
          return memo;
        }, []);

        return {
          name,
          protocol,
          port: containerPort,
          lbAddress: lbAddress.join(', '),
          container: ServiceConfigDisplayUtil.getContainerNameWithIcon(container)
        };
      })
    );
    
    return memo;
  }, []);

  if (!endpoints.length) {
    return <noscript />;
  }

  return (
    <div>
      <Heading level={1}>Network</Heading>
      <Section key="pod-general-section">

        {/* General section */}
        <Row>
          <Label>Network Type</Label>
          <ValueWithDefault
            defaultValue={<em>Unknown</em>}
            value={getNetworkTypes(appConfig.networks)} />
        </Row>
        <Row>
          <Label>Load Balancer Type</Label>
          <ValueWithDefault
            value={getLoadBalancerType(appConfig)} />
        </Row>
        <Row>
          <Label>Network Type</Label>
          <ValueWithDefault
            value={getExtLoadBalancerType(appConfig)} />
        </Row>

        {/* Service endpoints */}
        <Heading level={3}>
          Service Endpoints
        </Heading>
        <ConfigurationMapTable
          className="table table-simple table-break-word flush-bottom"
          columnDefaults={{
            hideIfEmpty: true
          }}
          columns={[
            {
              heading: 'Name',
              prop: 'name'
            },
            {
              heading: 'Protocol',
              prop: 'protocol'
            },
            {
              heading: 'Port',
              prop: 'port'
            },
            {
              heading: 'Load Balanced Address',
              prop: 'lbAddress'
            },
            {
              heading: 'Container',
              prop: 'container'
            }
          ]}
          data={endpoints} />

      </Section>
    </div>
  );
};
