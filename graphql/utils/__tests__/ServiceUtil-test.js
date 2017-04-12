jest.unmock('../ServiceUtil');

import HealthStatus from '../../../plugins/services/src/js/constants/HealthStatus';
import ServiceStatus from '../../../plugins/services/src/js/constants/ServiceStatus';
import ServiceUtil from '../ServiceUtil';

describe('ServiceUtil', () => {

  describe('getHealth()', () => {
    it('returns NA health status', () => {
      let service = {};

      expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.NA);
    });

    it('returns correct health status for healthy services', () => {
      let service = {
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      };

      expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.HEALTHY);
    });

    it('returns correct health status for unhealthy services', () => {
      let service = {
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 1
      };

      expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.UNHEALTHY);
    });

    it('returns correct health status for idle services', () => {
      let service = {
        healthChecks: [{path: '', protocol: 'HTTP'}],
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      };

      expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.IDLE);
    });

    it('returns correct health status for NA services', () => {
      let service = {
        healthChecks: [],
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0
      };

      expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.NA);
    });

    it('returns correct health status for NA services with health checks',
      () => {
        let service = {
          healthChecks: [{path: '', protocol: 'HTTP'}],
          tasksStaged: 0,
          tasksRunning: 1,
          tasksHealthy: 0,
          tasksUnhealthy: 0
        };

        expect(ServiceUtil.getHealth(service)).toEqual(HealthStatus.NA);
      });
  });

  describe('getServiceStatus()', () => {

    it('returns correct status object for running app', () => {
      let service = {
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      };

      expect(ServiceUtil.getServiceStatus(service))
        .toEqual(ServiceStatus.RUNNING);
    });

    it('returns correct status for suspended app', () => {
      let service = {
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: []
      };

      expect(ServiceUtil.getServiceStatus(service))
        .toEqual(ServiceStatus.SUSPENDED);
    });

    it('returns correct status for deploying app', () => {
      let service = {
        tasksStaged: 0,
        tasksRunning: 15,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 0,
        deployments: [{id: '4d08fc0d-d450-4a3e-9c85-464ffd7565f1'}]
      };

      expect(ServiceUtil.getServiceStatus(service))
        .toEqual(ServiceStatus.DEPLOYING);
    });

    it('returns n/a status object when no other status is found', () => {
      let service = {
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1,
        deployments: []
      };

      expect(ServiceUtil.getServiceStatus(service))
        .toEqual(ServiceStatus.NA);
    });

    it('tolerates a missing deployments field', () => {
      let service = {
        tasksStaged: 0,
        tasksRunning: 0,
        tasksHealthy: 0,
        tasksUnhealthy: 0,
        instances: 1
      };
      expect(() => {
        ServiceUtil.getServiceStatus(service);
      }).not.toThrow();
    });

  });

  describe('getTasksSummary()', () => {

    it('returns correct task summary', () => {
      let service = {
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 1,
        tasksHealthy: 1,
        tasksUnhealthy: 0
      };

      expect(ServiceUtil.getTasksSummary(service)).toEqual({
        staged: 0,
        running: 1,
        healthy: 1,
        unhealthy: 0,
        unknown: 0,
        overCapacity: 0
      });
    });

    it('returns correct task summary for overcapcity and unknown', () => {
      let service = {
        instances: 2,
        tasksStaged: 0,
        tasksRunning: 4,
        tasksHealthy: 2,
        tasksUnhealthy: 0
      };

      expect(ServiceUtil.getTasksSummary(service)).toEqual({
        staged: 0,
        running: 4,
        healthy: 2,
        unhealthy: 0,
        unknown: 2,
        overCapacity: 2
      });
    });

  });

});
