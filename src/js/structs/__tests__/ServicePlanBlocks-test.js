import ServicePlanBlocks from '../ServicePlanBlocks';
import ServicePlanStatusTypes from '../../constants/ServicePlanStatusTypes';

describe('ServicePlanBlocks', function () {

  describe('#getActive', function () {

    it('should return an empty array when no blocks are active', function () {
      let Blocks = new ServicePlanBlocks({
        items: [{
          status: ServicePlanStatusTypes.COMPLETE
        }]
      });

      expect(Blocks.getActive()).toEqual([]);
    });

    it('should return an array of blocks that are in progress', function () {
      let Blocks = new ServicePlanBlocks({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: 'foo',
            status: ServicePlanStatusTypes.IN_PROGRESS
          },
          {
            name: 'bar',
            status: ServicePlanStatusTypes.IN_PROGRESS
          }
        ]
      });

      expect(Blocks.getActive()[0].getName()).toEqual('foo');
      expect(Blocks.getActive()[1].getName()).toEqual('bar');
    });

  });

  describe('#getComplete', function () {

    it('should return an empty array when no blocks are complete', function () {
      let Blocks = new ServicePlanBlocks({
        items: [{
          status: ServicePlanStatusTypes.IN_PROGRESS
        }]
      });

      expect(Blocks.getComplete()).toEqual([]);
    });

    it('should return an array of blocks that are complete', function () {
      let Blocks = new ServicePlanBlocks({
        items: [
          {
            status: ServicePlanStatusTypes.IN_PROGRESS
          },
          {
            name: 'foo',
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: 'bar',
            status: ServicePlanStatusTypes.COMPLETE
          }
        ]
      });

      expect(Blocks.getComplete()[0].getName()).toEqual('foo');
      expect(Blocks.getComplete()[1].getName()).toEqual('bar');
    });

  });

});
