const PodUtil = require('../PodUtil');
const Pod = require('../../structs/Pod');

describe('PodUtil', function () {
  beforeEach(function () {
    this.pod = new Pod({
      'instances': [
        {
          'id': 'pod-a1',
          'containers': [
            {
              'name': 'container-c1'
            },
            {
              'name': 'container-c2'
            }
          ]
        }
      ]
    });
  });

  describe('#isContainerMatchingText', function () {
    it('should match text on container name', function () {
      let instance = this.pod.getInstanceList().getItems()[0];
      let container = instance.getContainers()[0];

      expect(PodUtil.isContainerMatchingText(container, 'c1'))
        .toBeTruthy();
    });

    it('should not match wrong text on container name', function () {
      let instance = this.pod.getInstanceList().getItems()[0];
      let container = instance.getContainers()[0];

      expect(PodUtil.isContainerMatchingText(container, 'c3'))
        .toBeFalsy();
    });
  });

  describe('#isInstanceOrChildrenMatchingText', function () {
    it('should match text on instance id', function () {
      let instance = this.pod.getInstanceList().getItems()[0];

      expect(PodUtil.isInstanceOrChildrenMatchingText(instance, 'a1'))
        .toBeTruthy();
    });

    it('should match text on container names', function () {
      let instance = this.pod.getInstanceList().getItems()[0];

      expect(PodUtil.isInstanceOrChildrenMatchingText(instance, 'c1'))
        .toBeTruthy();
    });

    it('should not match if text is not present anywhere', function () {
      let instance = this.pod.getInstanceList().getItems()[0];

      expect(PodUtil.isInstanceOrChildrenMatchingText(instance, 'c4'))
        .toBeFalsy();
    });
  });

  describe('#mergeHistoricalInstanceList', function () {
    it('should properly append new instances', function () {
      let instances = this.pod.getInstanceList();
      let historicalInstances = [
        {
          'id': 'pod-a2',
          'containers': [
            {
              'name': 'container-c1'
            }
          ]
        }
      ];

      instances = PodUtil.mergeHistoricalInstanceList(instances,
        historicalInstances);

      expect(instances.getItems().length).toEqual(2);
      expect(instances.getItems()[1].get()).toEqual(historicalInstances[0]);
    });

    it('should properly append new containers on existing items', function () {
      let instances = this.pod.getInstanceList();
      let historicalInstances = [
        {
          'id': 'pod-a1',
          'containers': [
            {
              'name': 'container-c3'
            }
          ]
        }
      ];

      instances = PodUtil.mergeHistoricalInstanceList(instances,
        historicalInstances);

      expect(instances.getItems().length).toEqual(1);
      expect(instances.getItems()[0].getContainers().length).toEqual(3);
      expect(instances.getItems()[0].getContainers()[2].get())
        .toEqual(historicalInstances[0].containers[0]);
    });
  });

});
