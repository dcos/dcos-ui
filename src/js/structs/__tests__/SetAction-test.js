let ActionSet = require('../SetAction');

describe('ActionSet', function () {
  describe('#constructor', function () {
    it('should have the SET type', function () {
      let action = new ActionSet(0, 0);
      expect(action.type).toEqual('SET');
    });

    it('type should not be writeable', function () {
      let action = new ActionSet(0, 0);
      expect(() => action.type = 'EVIL').toThrowError();
    });
  });
});
