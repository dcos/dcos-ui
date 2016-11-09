import ServiceConfigDisplayUtil from '../utils/ServiceConfigDisplayUtil';
import Units from '../../../../../src/js/utils/Units';
import Util from '../../../../../src/js/utils/Util';

module.exports = {
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
};
