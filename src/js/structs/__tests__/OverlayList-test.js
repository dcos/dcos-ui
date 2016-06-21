let Overlay = require('../Overlay');
let OverlayList = require('../OverlayList');

describe('OverlayList', function () {

  describe('#constructor', function () {

    it('creates instances of Overlay', function () {
      let items = [{foo: 'bar'}];

      expect(
        new OverlayList({items}).getItems()[0] instanceof Overlay
      ).toBe(true);
    });

  });

});
