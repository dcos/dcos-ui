import PluginTestUtils from 'PluginTestUtils';

let Overlay = require('../Overlay');

describe('Overlay', function () {

  beforeEach(function () {
    this.overlay = new Overlay({
      info: {name: 'foo', prefix: 24, subnet: '192.168.0.0/24'}
    });
  });

  describe('#getPrefix', function () {

    it('returns a value of type number', function () {
      expect(typeof this.overlay.getPrefix()).toEqual('number');
    });

    it('returns undefined if no info was provided', function () {
      expect(new Overlay({}).getPrefix()).toEqual(undefined);
    });

    it('returns undefined if no options was provided', function () {
      expect(new Overlay().getPrefix()).toEqual(undefined);
    });

  });

  describe('#getName', function () {

    it('returns a value of type string', function () {
      expect(typeof this.overlay.getName()).toEqual('string');
    });

    it('returns undefined if no info was provided', function () {
      expect(new Overlay({}).getName()).toEqual(undefined);
    });

    it('returns undefined if no options was provided', function () {
      expect(new Overlay().getName()).toEqual(undefined);
    });

  });

  describe('#getSubnet', function () {

    it('returns a value of type string', function () {
      expect(typeof this.overlay.getSubnet()).toEqual('string');
    });

    it('returns undefined if no info was provided', function () {
      expect(new Overlay({}).getSubnet()).toEqual(undefined);
    });

    it('returns undefined if no options was provided', function () {
      expect(new Overlay().getSubnet()).toEqual(undefined);
    });

  });

});
