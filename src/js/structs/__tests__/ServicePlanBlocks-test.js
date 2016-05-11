import ServicePlanBlocks from '../ServicePlanBlocks';
import ServicePlanStatusTypes from '../../constants/ServicePlanStatusTypes';

describe('ServicePlanBlocks', function () {

  describe('#getActive', function () {

    it('should return null when no active blocks', function () {
      let Blocks = new ServicePlanBlocks({
        items: [{
          status: ServicePlanStatusTypes.COMPLETE
        }]
      });

      expect(Blocks.getActive()).toEqual(null);
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

  describe('#getActiveBlockCount', function () {

    it('should return 0 when there are no active blocks', function () {
      let Blocks = new ServicePlanBlocks({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: 'waiting',
            status: ServicePlanStatusTypes.WAITING
          }
        ]
      });

      expect(Blocks.getActiveBlockCount()).toEqual(0);
    });

    it('should return the correct number of active blocks', function () {
      let Blocks = new ServicePlanBlocks({
        items: [
          {
            status: ServicePlanStatusTypes.COMPLETE
          },
          {
            name: 'waiting',
            status: ServicePlanStatusTypes.WAITING
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

      expect(Blocks.getActiveBlockCount()).toEqual(2);
    });

  });

});
