jest.dontMock('../ServiceConfigUtil');

const ServiceConfigUtil = require('../ServiceConfigUtil');

describe('ServiceConfigUtil', function () {
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
