let HealthStatus = require('../../constants/HealthStatus');
let Service = require('../Service');
let VolumeList = require('../VolumeList');
let ServiceImages = require('../../constants/ServiceImages');
let ServiceStatus = require('../../constants/ServiceStatus');
let TaskStats = require('../TaskStats');

describe('Service', function () {

  describe('#getArguments', function () {

    it('returns array', function () {
      let service = new Service({
        args: []
      });

      expect(Array.isArray(service.getArguments())).toBeTruthy();
    });

    it('returns correct arguments', function () {
      let service = new Service({
        args: [
          '--name \'etcd0\'',
          '--advertise-client-urls \'http://192.168.33.10:2379\''
        ]
      });

      expect(service.getArguments()).toEqual([
        '--name \'etcd0\'',
        '--advertise-client-urls \'http://192.168.33.10:2379\''
      ]);
    });

  });

  describe('#getCommand', function () {

    it('returns correct command', function () {
      let service = new Service({
        cmd: 'sleep 999'
      });

      expect(service.getCommand()).toEqual('sleep 999');
    });

  });

  describe('#getContainer', function () {

    it('returns correct container data', function () {
      let service = new Service({
        container: {
          type: 'DOCKER',
          volumes: [],
          docker: {
            image: 'mesosphere/marathon:latest',
            network: 'HOST',
            privileged: false,
            parameters: [],
            forcePullImage: false
          }
        }
      });

      expect(service.getContainer()).toEqual({
        type: 'DOCKER',
        volumes: [],
        docker: {
          image: 'mesosphere/marathon:latest',
          network: 'HOST',
          privileged: false,
          parameters: [],
          forcePullImage: false
        }
      });
    });

  });

  describe('#getDeployments', function () {
    it('should return an empty array', function () {
      let service = new Service({
        deployments: []
      });

      expect(service.getDeployments()).toEqual([]);
    });

    it('should return an array with one deployment', function () {
      let service = new Service({
        deployments: [
          {id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f7'}
        ]
      });

      expect(service.getDeployments()).toEqual([
        {id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f7'}
      ]);
    });
  });

  describe('#getEnvironmentVariables', function () {

    it('returns correct command', function () {
      let service = new Service({
        env: {secretName: 'test'}
      });

      expect(service.getEnvironmentVariables()).toEqual({secretName: 'test'});
    });

  });

  describe('#getExecuter', function () {

    it('returns correct command', function () {
      let service = new Service({
        executor: '//cmd'
      });

      expect(service.getExecutor()).toEqual('//cmd');
    });

  });

  describe('#getHealth', function () {

    it('returns NA health status', function () {
      let service = new Service();

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it('returns correct health status for healthy services', function () {
      let service = new Service({
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

    it('returns correct health status for unhealthy services', function () {
      let service = new Service({
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 1
      });

      expect(service.getHealth()).toEqual(HealthStatus.UNHEALTHY);
    });

    it('returns correct health status for idle services', function () {
      let service = new Service({
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.IDLE);
    });

    it('returns correct health status for NA services', function () {
      let service = new Service({
        healthChecks: [],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      });

      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it('returns correct health status for NA services with health checks',
      function () {
        let service = new Service({
          healthChecks: [{path: '', protocol: 'HTTP'}],
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0
        });

        expect(service.getHealth()).toEqual(HealthStatus.NA);
      });
  });

  describe('#getHealthChecks', function () {

    it('returns correct health check data', function () {
      let service = new Service({
        healthChecks: [{path: '', protocol: 'HTTP'}]
      });

      expect(service.getHealthChecks()).toEqual([{path: '', protocol: 'HTTP'}]);
    });

  });

  describe('#getId', function () {

    it('returns correct id', function () {
      let service = new Service({
        id: '/test/cmd'
      });

      expect(service.getId()).toEqual('/test/cmd');
    });

  });

  describe('#getImages', function () {

    it('defaults to NA images', function () {
      let service = new Service({});

      expect(service.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });

    it('returns correct images', function () {
      let service = new Service({
        images: {
          'icon-small': 'icon-small@2x.png',
          'icon-medium': 'icon-medium@2x.png',
          'icon-large': 'icon-large@2x.png'
        }
      });

      expect(service.getImages()).toEqual({
        'icon-small': 'icon-small@2x.png',
        'icon-medium': 'icon-medium@2x.png',
        'icon-large': 'icon-large@2x.png'
      });
    });

  });

  describe('#getInstancesCount', function () {

    it('returns correct instances', function () {
      let service = new Service({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });

  });

  describe('#getLabels', function () {

    it('returns correct labels', function () {
      let service = new Service({
        labels: {
          label_1: '1',
          label_2: '2'
        }
      });

      expect(service.getLabels()).toEqual({
        label_1: '1',
        label_2: '2'
      });
    });

  });

  describe('#getLastConfigChange', function () {

    it('returns correct date', function () {
      let service = new Service({
        versionInfo: {
          lastConfigChangeAt: '2016-03-22T10:46:07.354Z'
        }
      });

      expect(service.getLastConfigChange()).toEqual('2016-03-22T10:46:07.354Z');
    });

  });

  describe('#getLastScaled', function () {

    it('returns correct date', function () {
      let service = new Service({
        versionInfo: {
          lastScalingAt: '2016-03-22T10:46:07.354Z'
        }
      });

      expect(service.getLastScaled()).toEqual('2016-03-22T10:46:07.354Z');
    });

  });

  describe('#getName', function () {

    it('returns correct name', function () {
      let service = new Service({
        id: '/test/cmd'
      });

      expect(service.getName()).toEqual('cmd');
    });

  });

  describe('#getPorts', function () {

    it('returns correct port data', function () {
      let service = new Service({
        ports: [10001, 10002]
      });

      expect(service.getPorts()).toEqual([10001, 10002]);
    });

  });

  describe('#getResources', function () {

    it('returns correct resource data', function () {
      let service = new Service({
        cpus: 1,
        mem: 2048,
        disk: 0
      });

      expect(service.getResources()).toEqual({
        cpus: 1,
        mem: 2048,
        disk: 0
      });
    });

  });

  describe('#getStatus', function () {

    it('returns correct status for running app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.RUNNING.displayName);
    });

    it('returns correct status for suspended app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.SUSPENDED.displayName);
    });

    it('returns correct status for deploying app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'}]
      });

      expect(service.getStatus()).toEqual(ServiceStatus.DEPLOYING.displayName);
    });

    it('returns correct status for deploying app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getStatus()).toEqual(ServiceStatus.NA.displayName);
    });

  });

  describe('#getServiceStatus', function () {

    it('returns correct status object for running app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getServiceStatus())
        .toEqual(ServiceStatus.RUNNING);
    });

    it('returns correct status for suspended app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      });

      expect(service.getServiceStatus())
        .toEqual(ServiceStatus.SUSPENDED);
    });

    it('returns correct status for deploying app', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'}]
      });

      expect(service.getServiceStatus())
        .toEqual(ServiceStatus.DEPLOYING);
    });

    it('returns n/a status object when no other status is found', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      });

      expect(service.getServiceStatus())
        .toEqual(ServiceStatus.NA);
    });

  });

  describe('#getTasksSummary', function () {

    it('returns correct task summary', function () {
      let service = new Service({
        lastTaskFailure: {
          appId: '/toggle',
          host: '10.141.141.10',
          message: 'Abnormal executor termination',
          state: 'TASK_FAILED',
          taskId: 'toggle.cc427e60-5046-11e4-9e34-56847afe9799',
          timestamp: '2014-09-12T23:23:41.711Z',
          version: '2014-09-12T23:28:21.737Z'
        }
      });

      expect(service.getLastTaskFailure()).toEqual({
        appId: '/toggle',
        host: '10.141.141.10',
        message: 'Abnormal executor termination',
        state: 'TASK_FAILED',
        taskId: 'toggle.cc427e60-5046-11e4-9e34-56847afe9799',
        timestamp: '2014-09-12T23:23:41.711Z',
        version: '2014-09-12T23:28:21.737Z'
      });
    });

  });

  describe('#getLastTaskFailure', function () {

    it('returns correct task summary', function () {
      let service = new Service({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      });

      expect(service.getTasksSummary()).toEqual({
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0,
        tasksUnknown: 0
      });
    });

  });

  describe('#getTaskStats', function () {

    it('returns task stats instance', function () {
      let service = new Service({taskStats:{}});

      expect(service.getTaskStats() instanceof TaskStats).toBeTruthy();
    });

  });

  describe('#getFetch', function () {

    beforeEach(function () {
      this.instance = new Service({
        fetch: [{
          uri: 'http://resource/uri',
          extract: true,
          executable: false,
          cache: false
        }]
      });
    });

    it('returns array', function () {
      expect(Array.isArray(this.instance.getFetch())).toBeTruthy();
    });

    it('returns correct uris', function () {
      expect(this.instance.getFetch()).toEqual([{
        uri: 'http://resource/uri',
        extract: true,
        executable: false,
        cache: false
      }]);
    });

  });

  describe('#getConstraints', function () {

    beforeEach(function () {
      this.instance = new Service({
        'constraints': [
          [
            'hostname',
            'LIKE',
            'test'
          ],
          [
            'hostname',
            'UNLIKE',
            'no-test'
          ]
        ]
      });
    });

    it('returns array', function () {
      expect(Array.isArray(this.instance.getConstraints())).toBeTruthy();
    });

    it('returns correct constraints', function () {
      expect(this.instance.getConstraints()).toEqual([
        [
          'hostname',
          'LIKE',
          'test'
        ],
        [
          'hostname',
          'UNLIKE',
          'no-test'
        ]
      ]);
    });

  });

  describe('#getUser', function () {

    it('returns correct user', function () {
      let service = new Service({
        user: 'sudo'
      });

      expect(service.getUser()).toEqual('sudo');
    });

  });

  describe('#getAcceptedResourceRoles', function () {

    it('returns correct user', function () {
      let service = new Service({
        acceptedResourceRoles: [
          'public_slave'
        ]
      });

      expect(service.getAcceptedResourceRoles()).toEqual(['public_slave']);
    });

  });

  describe('#getVersion', function () {

    it('returns correct version', function () {
      let service = new Service({
        version: '2016-03-22T10:46:07.354Z'
      });

      expect(service.getVersion()).toEqual('2016-03-22T10:46:07.354Z');
    });

  });

  describe('#getVersions', function () {

    it('returns correct versions map', function () {
      const versionID = '2016-03-22T10:46:07.354Z';
      let service = new Service({
        versions: new Map([[versionID]])
      });

      expect(service.getVersions())
        .toEqual(new Map([[versionID]]));
    });

  });

  describe('#getVersionInfo', function () {

    it('returns correct version info', function () {
      let service = new Service({
        version: '2016-03-22T10:46:07.354Z',
        versionInfo: {
          lastConfigChangeAt: '2016-03-22T10:46:07.354Z',
          lastScalingAt: '2016-03-22T10:46:07.354Z'
        }
      });

      expect(service.getVersionInfo()).toEqual({
        currentVersionID: '2016-03-22T10:46:07.354Z',
        lastConfigChangeAt: '2016-03-22T10:46:07.354Z',
        lastScalingAt: '2016-03-22T10:46:07.354Z'
      });
    });

  });

  describe('#getCpus', function () {
    it('returns the correct cpus', function () {
      let service = new Service({
        cpus: 0.5
      });

      expect(service.getCpus()).toEqual(0.5);
    })
  });

  describe('#getDisk', function () {
    it('returns the correct disk', function () {
      let service = new Service({
        disk: 125
      });

      expect(service.getDisk()).toEqual(125);
    });
  });

  describe('#getMem', function () {
    it('returns the correct mem', function () {
      let service = new Service({
        mem: 49
      });

      expect(service.getMem()).toEqual(49);
    })
  });

  describe('#getVolumes', function () {

    it('returns volume list', function () {
      let service = new Service({
        volumes: [{
          containerPath: 'path',
          host: '0.0.0.1',
          id: 'volume-id',
          mode: 'RW',
          size: 2048,
          status: 'Attached',
          type: 'Persistent'
        }]
      });

      expect(service.getVolumes() instanceof VolumeList).toBeTruthy();
    });

    it('returns empty volume list if volumes data is undefined', function () {
      let service = new Service({});

      expect(service.getVolumes().getItems().length).toEqual(0);
    });

  });

  describe('#getResidency', function () {
    it('should return the right residency value', function () {
      let service = new Service({
        residency: {
          relaunchEscalationTimeoutSeconds: 10,
          taskLostBehavior: 'WAIT_FOREVER'
        }
      });

      expect(service.getResidency()).toEqual({
        relaunchEscalationTimeoutSeconds: 10,
        taskLostBehavior: 'WAIT_FOREVER'
      });
    });
  });

  describe('#getUpdateStrategy', function () {
    it('should return the right updateStrategy value', function () {
      let service = new Service({
        updateStrategy: {
          maximunOverCapacity: 0,
          minimumHealthCapacity: 0
        }
      });

      expect(service.getUpdateStrategy()).toEqual({
        maximunOverCapacity: 0,
        minimumHealthCapacity: 0
      });
    });
  });

  describe('#getIpAddress', function () {
    it('should return the right ipAddress value', function () {
      let service = new Service({ipAddress:{networkName: 'd-overlay-1'}});

      expect(service.getIpAddress()).toEqual({networkName: 'd-overlay-1'});
    });
  });

});
