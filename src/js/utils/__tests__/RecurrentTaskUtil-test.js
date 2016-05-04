jest.dontMock('../RecurrentTaskUtil');

var RecurrentTaskUtil = require('../RecurrentTaskUtil');

describe('RecurrentTaskUtil', function () {

  let triggerAnimationFrame = function () {
  };

  beforeEach(function () {
    global.requestAnimationFrame = function (callback) {
      triggerAnimationFrame = callback;
    };
  });

  afterEach(function () {
    global.requestAnimationFrame = null;
  });

  describe('#scheduleTask', function () {

    it('should schedule and execute a task', function () {
      let alpha = jest.genMockFunction();
      RecurrentTaskUtil.scheduleTask('alpha', alpha, 1000);
      triggerAnimationFrame(1000);

      expect(alpha).toBeCalled();
    });

    it('should schedule and execute a task in a given interval', function () {
      let alpha = jest.genMockFunction();
      RecurrentTaskUtil.scheduleTask('alpha', alpha, 1000);
      triggerAnimationFrame(0);
      triggerAnimationFrame(500);
      triggerAnimationFrame(1000);
      triggerAnimationFrame(1500);
      triggerAnimationFrame(2000);
      triggerAnimationFrame(2500);

      expect(alpha.mock.calls.length).toEqual(3);
    });

    it('should execute all tasks in the correct interval', function () {
      let alpha = jest.genMockFunction();
      let beta = jest.genMockFunction();
      let gamma = jest.genMockFunction();
      RecurrentTaskUtil.scheduleTask('alpha', alpha, 1000);
      RecurrentTaskUtil.scheduleTask('beta', beta, 500);
      RecurrentTaskUtil.scheduleTask('gamma', gamma, 1500);
      triggerAnimationFrame(0);
      triggerAnimationFrame(500);
      triggerAnimationFrame(1000);
      triggerAnimationFrame(1500);
      triggerAnimationFrame(2000);
      triggerAnimationFrame(2500);
      triggerAnimationFrame(3000);

      expect(alpha.mock.calls.length).toEqual(4);
      expect(beta.mock.calls.length).toEqual(7);
      expect(gamma.mock.calls.length).toEqual(3);
    });

  });

  describe('#stopTask', function () {

    it('should stop the given scheduled task', function () {
      let alpha = jest.genMockFunction();
      let beta = jest.genMockFunction();
      RecurrentTaskUtil.scheduleTask('alpha', alpha, 1000);
      RecurrentTaskUtil.scheduleTask('beta', beta, 1000);
      triggerAnimationFrame(1000);
      RecurrentTaskUtil.stopTask('alpha');
      triggerAnimationFrame(2000);

      expect(alpha.mock.calls.length).toEqual(1);
      expect(beta.mock.calls.length).toEqual(2);
    });

  });
});
