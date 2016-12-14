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

  return networks.map(({mode}) => NETWORK_MODE_NAME[mode]).join(', ');
}

class PodNetworkConfigSection extends React.Component {
  getColumns() {
    return [
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
    ];
  }

  render() {
    const appConfig = this.props.appConfig;
    const {containers = []} = appConfig;
    let endpoints = containers.reduce((memo, container) => {
      const {endpoints = []} = container;

      return memo.concat(
        endpoints.map(({containerPort, labels={}, name, protocol}) => {
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

          {/* Service endpoints */}
          <Heading level={3}>
            Service Endpoints
          </Heading>
          <ConfigurationMapTable
            className="table table-simple table-break-word table-fixed-layout flush-bottom"
            columnDefaults={{hideIfEmpty: true}}
            columns={this.getColumns()}
            data={endpoints} />

        </Section>
      </div>
    );
  }
};

PodNetworkConfigSection.defaultProps = {
  appConfig: {}
};

PodNetworkConfigSection.propTypes = {
  appConfig: React.PropTypes.object
};

module.exports = PodNetworkConfigSection;
