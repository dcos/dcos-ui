jest.dontMock('../ServiceConfigUtil');

const ServiceConfigUtil = require('../ServiceConfigUtil');

describe('ServiceConfigUtil', function () {

  describe('#matchVIPLabel', function () {

    it('returns true', function () {
      expect(
        ServiceConfigUtil.matchVIPLabel('VIP_1')
      ).toBeTruthy();
    });

    it('returns false', function () {
      expect(
        ServiceConfigUtil.matchVIPLabel('LABEL')
      ).toBeFalsy();
    });

  });

  describe('#findVIPLabel', function () {

    it('returns label', function () {
      expect(
        ServiceConfigUtil.findVIPLabel({VIP_1: ''})
      ).toEqual('VIP_1');
    });

    it('returns undefined', function () {
      expect(
        ServiceConfigUtil.findVIPLabel({LABEL: ''})
      ).toEqual(undefined);
    });

  });

  describe('#hasVIPLabel', function () {

    it('returns true', function () {
      expect(
        ServiceConfigUtil.hasVIPLabel({VIP_1: ''})
      ).toBeTruthy();
    });

    it('returns false', function () {
      expect(
        ServiceConfigUtil.hasVIPLabel({LABEL: ''})
      ).toBeFalsy();
    });

  });

  describe('#buildHostName', function () {
    it('adds a service address to the definition', function () {
      expect(
        ServiceConfigUtil.buildHostName('1234', 80)
      ).toEqual('1234.marathon.l4lb.thisdcos.directory:80');
    });

  });

});
