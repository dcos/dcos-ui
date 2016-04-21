let HealthStatus = require('../../constants/HealthStatus');
let Service = require('../Service');
let ServiceImages = require('../../constants/ServiceImages');
let ServiceStatus = require('../../constants/ServiceStatus');

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

  });

  describe('#getTasksSummary', function () {

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

  describe('#getUser', function () {

    it('returns correct user', function () {
      let service = new Service({
        user: 'sudo'
      });

      expect(service.getUser()).toEqual('sudo');
    });

  });

  describe('#getVersionInfo', function () {

    it('returns correct version info', function () {
      let service = new Service({
        versionInfo: {
          lastConfigChangeAt: '2016-03-22T10:46:07.354Z',
          lastScalingAt: '2016-03-22T10:46:07.354Z'
        }
      });

      expect(service.getVersionInfo()).toEqual({
        lastConfigChangeAt: '2016-03-22T10:46:07.354Z',
        lastScalingAt: '2016-03-22T10:46:07.354Z'
      });
    });

  });

});
