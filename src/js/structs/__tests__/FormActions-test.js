const FormAction = require('../FormAction');

describe('FormAction', function () {
  describe('#constructor', function () {
    it('should have the type SET', function () {
      const formAction = new FormAction(0, 0);
      expect(formAction.type).toEqual('SET');
    });

    it('should have the type DEL', function () {
      const formAction = new FormAction(0, 0, 'DEL');
      expect(formAction.type).toEqual('DEL');
    });

    it('type should not be writeable', function () {
      const formAction = new FormAction(0, 0);
      expect(() => formAction.type = 'EVIL DELETE').toThrowError();
    });

    it('Should have the value which has been set', function () {
      const value = 'test';
      const formAction = new FormAction(0, value);
      expect(formAction.value).toEqual(value);
    });

    it('value should not be writeable', function () {
      const formAction = new FormAction(0, 0);
      expect(() => formAction.value = 'EVIL value').toThrowError();
    });

    it('Should have the path which has been set', function () {
      const path = 'path';
      const formAction = new FormAction(path, 0);
      expect(formAction.path).toEqual(path);
    });

    it('path should not be writeable', function () {
      const formAction = new FormAction(0, 0);
      expect(() => formAction.path = 'EVIL path').toThrowError();
    });

  });
});
