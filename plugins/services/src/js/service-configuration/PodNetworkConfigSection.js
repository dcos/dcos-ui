import React from 'react';

import ConfigurationMapEditAction from '../components/ConfigurationMapEditAction';
import ConfigurationMapTable from '../components/ConfigurationMapTable';
import ConfigurationMapHeading from '../../../../../src/js/components/ConfigurationMapHeading';
import ConfigurationMapLabel from '../../../../../src/js/components/ConfigurationMapLabel';
import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';
import ConfigurationMapSection from '../../../../../src/js/components/ConfigurationMapSection';
import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import ConfigurationMapValueWithDefault from '../components/ConfigurationMapValueWithDefault';

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
    const {onEditClick} = this.props;
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
        <ConfigurationMapHeading level={1}>Network</ConfigurationMapHeading>
        <ConfigurationMapSection key="pod-general-section">

          {/* General section */}
          <ConfigurationMapRow>
            <ConfigurationMapLabel>Network Type</ConfigurationMapLabel>
            <ConfigurationMapValueWithDefault
              value={getNetworkTypes(appConfig.networks)} />
            <ConfigurationMapEditAction
              onEditClick={onEditClick}
              tabViewID="networking" />
          </ConfigurationMapRow>

          {/* Service endpoints */}
          <ConfigurationMapHeading level={3}>
            Service Endpoints
          </ConfigurationMapHeading>
          <ConfigurationMapTable
            columnDefaults={{hideIfEmpty: true}}
            columns={this.getColumns()}
            data={endpoints}
            onEditClick={onEditClick}
            tabViewID="networking" />

        </ConfigurationMapSection>
      </div>
    );
  }
};

PodNetworkConfigSection.defaultProps = {
  appConfig: {}
};

PodNetworkConfigSection.propTypes = {
  appConfig: React.PropTypes.object,
  onEditClick: React.PropTypes.func
};

module.exports = PodNetworkConfigSection;
