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
});
