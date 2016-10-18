let SetFormAction = require('../SetFormAction');

describe('SetFormAction', function () {
  describe('#constructor', function () {
    it('should have the SET type', function () {
      let setFormAction = new SetFormAction(0, 0);
      expect(setFormAction.type).toEqual('SET');
    });

    it('type should not be writeable', function () {
      let setFormAction = new SetFormAction(0, 0);
      expect(() => setFormAction.type = 'EVIL').toThrowError();
    });
  });
});
