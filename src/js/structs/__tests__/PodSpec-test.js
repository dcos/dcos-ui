jest.dontMock('../../../../tests/_fixtures/pods/PodFixture');

const PodSpec = require('../PodSpec');

const PodFixture = require('../../../../tests/_fixtures/pods/PodFixture');

describe('PodSpec', function () {

  describe('#constructor', function () {

    it('should correctly create instances', function () {
      let instance = new PodSpec(Object.assign({}, PodFixture.spec));

      expect(instance.get()).toEqual(PodFixture.spec);
    });

  });

  describe('#getContainers', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainers()).toEqual(PodFixture.spec.containers);
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getContainers()).toEqual([]);
    });

  });

  describe('#getContainerSpec', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainerSpec('container-1'))
        .toEqual(PodFixture.spec.containers[0]);
    });

  });

  describe('#getContainerCount', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getContainerCount()).toEqual(2);
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getContainerCount()).toEqual(0);
    });

  });

  describe('#getLabels', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getLabels()).toEqual({'POD_LABEL': 'foo'});
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getLabels()).toEqual({});
    });

  });

  describe('#getResourcesSummary', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getResourcesSummary()).toEqual({
        cpus: 1,
        mem: 128,
        gpus: 0,
        disk: 0
      });
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getResourcesSummary()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
    });

  });

  describe('#getScalingInstances', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getScalingInstances()).toEqual(10);
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getScalingInstances()).toEqual(1);
    });

  });

  describe('#getVersion', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getVersion()).toEqual('2016-08-29T01:01:01.001');
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getVersion()).toBeFalsy();
    });

  });

  describe('#getEnvironment', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getEnvironment()).toEqual(PodFixture.spec.environment);
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getEnvironment()).toEqual({});
    });

  });

  describe('#getUser', function () {

    it('should return the correct value', function () {
      let podSpec = new PodSpec(PodFixture.spec);

      expect(podSpec.getUser()).toEqual('root');
    });

    it('should return the correct default value', function () {
      let podSpec = new PodSpec();
      expect(podSpec.getUser()).toBeFalsy();
    });

  });
});
