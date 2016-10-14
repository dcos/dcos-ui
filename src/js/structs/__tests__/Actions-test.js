const Action = require('../Action');

describe('Action', function () {
  describe('#constructor', function () {
    it('should have the type SET', function () {
      const action = new Action(0, 0);
      expect(action.type).toEqual('SET');
    });

    it('should have the type DEL', function () {
      const action = new Action(0, 0, 'DEL');
      expect(action.type).toEqual('DEL');
    });

    it('type should not be writeable', function () {
      const action = new Action(0, 0);
      expect(() => action.type = 'EVIL DELETE').toThrowError();
    });

    it('Should have the value which has been set', function () {
      const value = 'test';
      const action = new Action(0, value);
      expect(action.value).toEqual(value);
    });

    it('value should not be writeable', function () {
      const action = new Action(0, 0);
      expect(() => action.value = 'EVIL value').toThrowError();
    });

    it('Should have the path which has been set', function () {
      const path = 'path';
      const action = new Action(path, 0);
      expect(action.path).toEqual(path);
    });

    it('path should not be writeable', function () {
      const action = new Action(0, 0);
      expect(() => action.path = 'EVIL path').toThrowError();
    });

  });
});
