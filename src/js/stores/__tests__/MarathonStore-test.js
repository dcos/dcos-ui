jest.dontMock('../../constants/HealthLabels');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../MarathonStore');
jest.dontMock('./fixtures/MockAppMetadata');
jest.dontMock('./fixtures/MockMarathonResponse.json');
jest.dontMock('./fixtures/MockParsedAppMetadata.json');

var HealthLabels = require('../../constants/HealthLabels');
var HealthTypes = require('../../constants/HealthTypes');
var MarathonStore = require('../MarathonStore');
var MockAppMetadata = require('./fixtures/MockAppMetadata');
var MockMarathonResponse = require('./fixtures/MockMarathonResponse.json');
var MockParsedAppMetadata = require('./fixtures/MockParsedAppMetadata.json');

// mock global string decoder
global.atob = function () {
  return MockAppMetadata.decodedString;
};

describe('MarathonStore', function () {

  describe('#getFrameworkHealth', function () {

    it('should return NA health when app has no health check', function () {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoHealthy.apps[0]
      );
      expect(health).toNotEqual(null);
      expect(health.key).toEqual('NA');
      expect(health.value).toEqual(HealthTypes.NA);
    });

    it('should return idle when app has no running tasks', function () {
      var health = MarathonStore.getFrameworkHealth(
        MockMarathonResponse.hasNoRunningTasks.apps[0]
      );
      expect(health.key).toEqual('IDLE');
    });

    it('should return unhealthy when app has only unhealthy tasks',
      function () {
        var health = MarathonStore.getFrameworkHealth(
          MockMarathonResponse.hasOnlyUnhealth.apps[0]
        );
        expect(health.key).toEqual('UNHEALTHY');
      }
    );

    it('should return unhealthy when app has both healthy and unhealthy tasks',
      function () {
        var health = MarathonStore.getFrameworkHealth(
          MockMarathonResponse.hasOnlyUnhealth.apps[0]
        );
        expect(health.key).toEqual('UNHEALTHY');
      }
    );

    it('should return healthy when app has healthy and no unhealthy tasks',
      function () {
        var health = MarathonStore.getFrameworkHealth(
          MockMarathonResponse.hasHealth.apps[0]
        );
        expect(health.key).toEqual('HEALTHY');
      }
    );

  });

  describe('#parseMetadata', function () {

    it('should parse metadata correctly', function () {
      var result = MarathonStore.parseMetadata(
        MockAppMetadata.encodedString
      );
      expect(result).toEqual(MockParsedAppMetadata);
    });

  });

  describe('#getFrameworkImages', function () {

    it('should return parsed images when app has metadata with images',
      function () {
        var images = MarathonStore.getFrameworkImages(
          MockMarathonResponse.hasMetadata.apps[0]
        );
        expect(images).toEqual(MockParsedAppMetadata.images);
      }
    );

    it('should return default images when app has metadata with images',
      function () {
        var images = MarathonStore.getFrameworkImages(
          MockMarathonResponse.hasHealth.apps[0]
        );
        expect(images).toEqual(MarathonStore.NA_IMAGES);
      }
    );

  });

  describe('#getServiceHealth', function () {

    it('returns NA when health is not available', function () {
      var health = MarathonStore.getServiceHealth('foo');
      expect(HealthLabels[health.key]).toEqual(HealthLabels.NA);
    });

    it('returns health for service', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasHealth);
      var health = MarathonStore.getServiceHealth('Framework 1');
      expect(HealthLabels[health.key]).toEqual(HealthLabels.HEALTHY);
    });

  });

  describe('#getServiceInstalledTime', function () {

    it('returns a dateString', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasVersion);
      let version = MarathonStore.getServiceInstalledTime('Framework 1');

      expect(!isNaN(Date.parse(version))).toEqual(true);
    });

    it('returns null when no service version', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasVersion);
      let version = MarathonStore.getServiceInstalledTime('bloop');

      expect(version).toEqual(null);
    });

  });

  describe('#getServiceVersion', function () {

    it('returns a version', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasVersion);
      let version = MarathonStore.getServiceVersion('Framework 1');

      expect(version).toEqual('0.1.0');
    });

    it('returns null when no service version', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasNoVersion);
      let version = MarathonStore.getServiceVersion('Framework 1');

      expect(version).toEqual(null);
    });

  });

  describe('#getServiceImages', function () {

    it('returns null when app is not found', function () {
      var images = MarathonStore.getServiceImages('foo');
      expect(images).toEqual(null);
    });

    it('returns an object when services are found', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages('Framework 1');
      expect(images).toEqual(jasmine.any(Object));
    });

    it('returns three sizes of images when services are found', function () {
      MarathonStore.processMarathonApps(MockMarathonResponse.hasMetadata);
      var images = MarathonStore.getServiceImages('Framework 1');
      var keys = Object.keys(images);
      expect(keys).toContain('icon-large');
      expect(keys).toContain('icon-medium');
      expect(keys).toContain('icon-small');
    });

  });

  describe('#processMarathonApps', function () {

    it('should set Marathon health to idle with no apps', function () {
      MarathonStore.processMarathonApps({apps: {}});
      var marathonApps = MarathonStore.get('apps');
      expect(marathonApps.marathon.health.key).toEqual('IDLE');
    });

    it('should set Marathon health to healthy with some apps', function () {
      MarathonStore.processMarathonApps(
        MockMarathonResponse.hasOnlyUnhealth
      );
      var marathonApps = MarathonStore.get('apps');
      expect(marathonApps.marathon.health.key).toEqual('HEALTHY');
    });

    it('should have apps with NA health if apps have no health checks', function () {
      MarathonStore.processMarathonApps(
        MockMarathonResponse.hasNoHealthy
      );
      var marathonApps = MarathonStore.get('apps');

      for (var key in marathonApps) {
        var appHealth = marathonApps[key].health;

        if (key === 'marathon') {
          // The marathon app should still be healthy
          expect(appHealth.key).toEqual('HEALTHY');
        } else {
          expect(appHealth.key).toEqual('NA');
          expect(appHealth.value).toEqual(HealthTypes.NA);
        }
      }
    });

  });

});
