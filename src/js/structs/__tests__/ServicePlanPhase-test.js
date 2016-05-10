import List from '../List';
import ServicePlanPhase from '../ServicePlanPhase';
import ServicePlanStatusTypes from '../../constants/ServicePlanStatusTypes';

describe('ServicePlanPhase', function () {

  describe('#getBlocks', function () {

    it('should return an instance of List', function () {
      let Phase = new ServicePlanPhase({
        blocks: []
      });

      expect(Phase.getBlocks() instanceof List).toEqual(true);
    });

    it('should return 1 block', function () {
      let Phase = new ServicePlanPhase({
        blocks: [{
          id: 'block-1'
        }]
      });

      expect(Phase.getBlocks().getItems().length).toEqual(1);
    });

  });

  describe('#getID', function () {

    it('should return id', function () {
      let Phase = new ServicePlanPhase({id: 'phase-1'});

      expect(Phase.getID()).toEqual('phase-1');
    });

  });

  describe('#getName', function () {

    it('should return name', function () {
      let Phase = new ServicePlanPhase({name: 'phase-2'});

      expect(Phase.getName()).toEqual('phase-2');
    });

  });

  describe('#isComplete', function () {

    it('should return false', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Phase.isComplete()).toEqual(false);
    });

    it('should return true', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Phase.isComplete()).toEqual(true);
    });

  });

  describe('#isInProgress', function () {

    it('should return false', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Phase.isInProgress()).toEqual(false);
    });

    it('should return true', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.IN_PROGRESS
      });

      expect(Phase.isInProgress()).toEqual(true);
    });

  });

  describe('#isPending', function () {

    it('should return false', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Phase.isPending()).toEqual(false);
    });

    it('should return true', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.PENDING
      });

      expect(Phase.isPending()).toEqual(true);
    });

  });

  describe('#isWaiting', function () {

    it('should return false', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.COMPLETE
      });

      expect(Phase.isWaiting()).toEqual(false);
    });

    it('should return true', function () {
      let Phase = new ServicePlanPhase({
        status: ServicePlanStatusTypes.WAITING
      });

      expect(Phase.isWaiting()).toEqual(true);
    });

  });

});
