import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import HostUtil from './HostUtil';
import Networking from '../../../../../src/js/constants/Networking';
import Units from '../../../../../src/js/utils/Units';
import Util from '../../../../../src/js/utils/Util';

const renderMillisecondsFromSeconds = (prop, row) => {
  let value = row[prop];

  if (value != null) {
    value = `${value * 1000} ms`;
  }

  return ServiceConfigDisplayUtil.getDisplayValue(value);
};

const getColumnClassNameFn = (classes) => {
  return (prop, sortBy) => {
    return classNames(classes, {
      'active': prop === sortBy.prop
    });
  };
};

const getColumnHeadingFn = (defaultHeading) => {
  return (prop, order, sortBy) => {
    let caretClassNames = classNames('caret', {
      [`caret--${order}`]: order != null,
      'caret--visible': sortBy.prop === prop
    });

    return (
      <span>
        {defaultHeading || prop}
        <span className={caretClassNames} />
      </span>
    );
  };
};

const ServiceConfigDisplayUtil = {
  displayValues: [
    {
      values: [
        {
          heading: 'General',
          headingLevel: 1
        },
        {
          key: 'id',
          label: 'Service ID',
          transformValue: (value) => {
            return value.split('/').pop();
          }
        },
        {
          key: 'instances',
          label: 'Instances'
        },
        {
          key: 'location',
          label: 'Location',
          transformValue: (value, appDefinition) => {
            let idSegments = Util.findNestedPropertyInObject(appDefinition, 'id').split('/');

            idSegments.pop();

            return `${idSegments.join('/')}/`;
          }
        },
        {
          key: 'container-runtime', // TODO: Figure out how to find this
          label: 'Container Runtime'
        },
        {
          key: 'cpus',
          label: 'CPU'
        },
        {
          key: 'mem',
          label: 'Memory',
          transformValue: (value) => {
            if (value == null) {
              return ServiceConfigDisplayUtil.getDisplayValue(value);
            }

            return Units.formatResource('mem', value);
          }
        },
        {
          key: 'disk',
          label: 'Disk',
          transformValue: (value) => {
            if (value == null) {
              return ServiceConfigDisplayUtil.getDisplayValue(value);
            }

            return Units.formatResource('disk', value);
          }
        },
        {
          key: 'gpus',
          label: 'GPU'
        },
        {
          key: 'container.docker.image',
          label: 'Container Image'
        },
        {
          key: 'container.docker.image', // TODO: Figure out how to find this
          label: 'Container ID'
        },
        {
          key: 'container.docker.privileged',
          label: 'Extended Runtime Priv.',
          transformValue: (value) => {
            // Cast boolean as a string.
            return String(value);
          }
        },
        {
          key: 'container.docker.forcePullImage',
          label: 'Force Pull on Launch',
          transformValue: (value) => {
            // Cast boolean as a string.
            return String(value);
          }
        },
        {
          key: 'cmd',
          label: 'Command',
          type: 'pre'
        },
        {
          key: 'artifacts', // TODO: Figure out how to find this
          label: 'Artifacts'
        }
      ]
    },
    {
      values: [
        {
          heading: 'Network',
          headingLevel: 1
        },
        {
          label: 'Network Type',
          transformValue: () => {
            // TODO: Figure out how to determine this value.
            return '🍾 network type';
          }
        },
        {
          label: 'Load Balancer Type',
          transformValue: () => {
            // TODO: Figure out how to determine this value.
            return '🍾 load balancer type';
          }
        },
        {
          label: 'Ext. Load Balancer',
          transformValue: () => {
            // TODO: Figure out how to determine this value.
            return '🍾 ext. load balancer';
          }
        },
        {
          heading: 'Service Endpoints',
          headingLevel: 2
        },
        {
          key: 'portDefinitions',
          render: (portDefinitions, appDefinition) => {
            const keys = {
              name: 'name',
              port: 'port',
              protocol: 'protocol'
            };

            if ((portDefinitions == null || portDefinitions.length === 0)) {
              let containerPortMappings = Util.findNestedPropertyInObject(
                appDefinition, 'container.docker.portMappings'
              );

              if (containerPortMappings != null
                && containerPortMappings.length !== 0) {
                portDefinitions = containerPortMappings;
                keys.port = 'containerPort';
              }
            }

            const columns = [
              {
                heading: getColumnHeadingFn('Name'),
                prop: keys.name,
                render: (prop, row) => {
                  return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Protocol'),
                prop: keys.protocol,
                className: getColumnClassNameFn(),
                render: (prop, row) => {
                  return ServiceConfigDisplayUtil.getDisplayValue(row[prop])
                    .split(',').join(', ');
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Port'),
                prop: keys.port,
                className: getColumnClassNameFn(),
                render: (prop, row) => {
                  // TODO: Figure out how to determine static or dynamic port.
                  return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Load Balanced Address'),
                prop: '',
                className: getColumnClassNameFn(),
                render: (prop, row) => {
                  // TODO: Only render this when necessary, figure out when
                  // necessary.
                  let hostname = HostUtil.stringToHostname(appDefinition.id);
                  let port = row[keys.port];

                  return `${hostname}${Networking.L4LB_ADDRESS}:${port}`;
                },
                sortable: true
              }
            ];

            return (
              <Table key="service-endpoints"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={portDefinitions} />
            );
          }
        }
      ]
    },
    {
      values: [
        {
          key: 'container.volumes',
          heading: 'Storage',
          headingLevel: 1
        },
        {
          key: 'container.volumes',
          render: (volumes) => {
            if (volumes == null) {
              return null;
            }

            const columns = [
              {
                heading: getColumnHeadingFn('Volume'),
                prop: 'volume',
                render: (prop, row) => {
                  let name = '';

                  if (row.name != null) {
                    name = ` (${row.name})`;
                  }

                  return `${row.type.join(' ')}${name}`;
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Size'),
                prop: 'size',
                render: (prop, row) => {
                  let value = row[prop];

                  if (value == null) {
                    return ServiceConfigDisplayUtil.getDisplayValue(value);
                  }

                  return Units.formatResource('disk', value);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Mode'),
                prop: 'mode',
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Container Mount Path'),
                prop: 'containerPath',
                className: getColumnClassNameFn(),
                sortable: true
              }
            ];

            let shouldDisplayHostPath = false;

            const volumesData = volumes.map((appVolume) => {
              // We don't want to mutate the appVolume value.
              let volume = {
                name: null,
                size: null,
                type: []
              };

              volume.containerPath = appVolume.containerPath;
              volume.mode = appVolume.mode;

              if (appVolume.persistent != null) {
                volume.size = appVolume.persistent.size;
                volume.type.push('Persistent', 'Local');
              } else {
                volume.type.push('External');
              }

              if (appVolume.external != null) {
                volume.name = appVolume.external.name;
              }

              if (appVolume.hostPath != null) {
                // Set this flag to true so that we render the hostPath column.
                shouldDisplayHostPath = true;
              }

              volume.hostPath =
                ServiceConfigDisplayUtil.getDisplayValue(appVolume.hostPath);

              return volume;
            });

            if (shouldDisplayHostPath) {
              columns.push({
                heading: getColumnHeadingFn('Host Path'),
                prop: 'hostPath',
                className: getColumnClassNameFn(),
                sortable: true
              });
            }

            return (
              <Table key="service-volumes"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={volumesData} />
            );
          }
        }
      ]
    },
    {
      values: [
        {
          key: 'env',
          heading: 'Environment Variables',
          headingLevel: 1
        },
        {
          key: 'env',
          render: (envData, appDefinition) => {
            const columns = [
              {
                heading: getColumnHeadingFn('Key'),
                prop: 'key',
                render: (prop, row) => {
                  return <code>{row[prop]}</code>;
                },
                className:
                  getColumnClassNameFn('configuration-map-table-label'),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Value'),
                prop: 'value',
                render: (prop, row) => {
                  let value = row[prop];

                  if (value.secret != null) {
                    let specifiedSecret =
                      appDefinition.secrets[value.secret] || {};

                    return (
                      <code>{specifiedSecret.source}</code>
                    );
                  }

                  return ServiceConfigDisplayUtil.getDisplayValue(value);
                },
                className:
                  getColumnClassNameFn('configuration-map-table-value'),
                sortable: true
              }
            ];

            const data = Object.keys(envData).map((envKey) => {
              return {key: envKey, value: envData[envKey]};
            });

            return (
              <Table key="secrets-table"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={data} />
            );
          }
        }
      ]
    },
    {
      values: [
        {
          key: 'labels',
          heading: 'Labels',
          headingLevel: 1
        },
        {
          key: 'labels',
          render: (labelsDataMap) => {
            const columns = [
              {
                heading: getColumnHeadingFn(),
                prop: 'key',
                render: (prop, row) => {
                  return <code>{row[prop]}</code>;
                },
                className:
                  getColumnClassNameFn('configuration-map-table-label'),
                sortable: true
              },
              {
                heading: getColumnHeadingFn(),
                prop: 'value',
                className:
                  getColumnClassNameFn('configuration-map-table-value'),
                sortable: true
              }
            ];

            const data = Object.keys(labelsDataMap).reduce((memo, labelKey) => {
              let value = ServiceConfigDisplayUtil
                .getDisplayValue(labelsDataMap[labelKey]);

              memo.push({key: labelKey, value});

              return memo;
            }, []);

            return (
              <Table key="labels-table"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={data} />
            );
          }

        }
      ]
    },
    {
      values: [
        {
          key: 'secrets',
          heading: 'Secrets',
          headingLevel: 1
        },
        {
          key: 'secrets',
          render: (secretsData) => {
            const columns = [
              {
                heading: getColumnHeadingFn(),
                prop: 'secret',
                render: (prop, row) => {
                  return <code>{row[prop]}</code>;
                },
                className:
                  getColumnClassNameFn('configuration-map-table-label'),
                sortable: true
              },
              {
                heading: getColumnHeadingFn(),
                prop: 'secretName',
                render: (prop, row) => {
                  return (
                    <code>
                      {ServiceConfigDisplayUtil.getDisplayValue(row[prop])}
                    </code>
                  );
                },
                className:
                  getColumnClassNameFn('configuration-map-table-value'),
                sortable: true
              }
            ];

            const data = Object.keys(secretsData).map((secretKey) => {
              return {
                secret: secretKey,
                secretName: secretsData[secretKey].source
              };
            });

            return (
              <Table key="secrets-table"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={data} />
            );
          }
        }
      ]
    },
    {
      values: [
        {
          key: 'healthChecks',
          heading: 'Health Checks',
          headingLevel: 1
        },
        {
          key: 'healthChecks',
          heading: 'Service Endpoint Health Checks',
          headingLevel: 2
        },
        {
          key: 'healthChecks',
          render: (healthChecks) => {
            let serviceEndpointHealthChecks = healthChecks.filter(
              (healthCheck) => {
                return healthCheck.protocol === 'HTTP'
                  || healthCheck.protocol === 'TCP';
              }
            );

            const columns = [
              {
                heading: getColumnHeadingFn('Protocol'),
                prop: 'protocol',
                render: (prop, row) => {
                  return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Path'),
                prop: 'path',
                className: getColumnClassNameFn(),
                render: (prop, row) => {
                  return ServiceConfigDisplayUtil.getDisplayValue(row[prop]);
                },
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Grace Period'),
                prop: 'gracePeriodSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Interval'),
                prop: 'intervalSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Timeout'),
                prop: 'timeoutSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Max Failures'),
                prop: 'maxConsecutiveFailures',
                className: getColumnClassNameFn(),
                sortable: true
              }
            ];

            return (
              <Table key="service-endpoint-health-checks"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={serviceEndpointHealthChecks} />
            );
          }
        },
        {
          heading: 'Command Health Checks',
          headingLevel: 2
        },
        {
          key: 'healthChecks',
          render: (healthChecks) => {
            let commandHealthChecks = healthChecks.filter((healthCheck) => {
              return healthCheck.protocol === 'COMMAND';
            });

            const columns = [
              {
                heading: getColumnHeadingFn('Command'),
                prop: 'command',
                render: (prop, row) => {
                  let command = row[prop] || {};

                  return (
                    <pre className="flush transparent wrap">
                      {ServiceConfigDisplayUtil.getDisplayValue(command.value)}
                    </pre>
                  );
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Grace Period'),
                prop: 'gracePeriodSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Interval'),
                prop: 'intervalSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Timeout'),
                prop: 'timeoutSeconds',
                className: getColumnClassNameFn(),
                render: renderMillisecondsFromSeconds,
                sortable: true
              },
              {
                heading: getColumnHeadingFn('Max Failures'),
                prop: 'maxConsecutiveFailures',
                className: getColumnClassNameFn(),
                sortable: true
              }
            ];

            return (
              <Table key="command-health-checks"
                className="table table-simple table-break-word flush-bottom"
                columns={columns}
                data={commandHealthChecks} />
            );
          }
        }
      ]
    }
  ],

  getDisplayValue(value) {
    // Return the emdash character.
    if (value == null || value === '') {
      return String.fromCharCode(8212);
    }

    // Display nested objects nicely if the render didn't already cover it.
    if (Util.isObject(value)) {
      return (
        <pre className="flush transparent wrap">
          {JSON.stringify(value)}
        </pre>
      );
    }

    return value;
  }
};

module.exports = ServiceConfigDisplayUtil;
