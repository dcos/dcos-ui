jest.dontMock('../AuthUtil');

var AuthUtil = require('../AuthUtil');

describe('AuthUtil', function () {

  describe('#isSubjectRemote', function () {

    it('returns false when the isRemote function returns false', function () {
      let item = {
        isRemote: function() { return false; }
      };
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });

    it('returns true when the isRemote function returns true', function () {
      let item = {
        isRemote: function() { return true; }
      };
      expect(AuthUtil.isSubjectRemote(item)).toBeTruthy();
    });

    it('returns false when isRemote is undefined', function () {
      let item = {};
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });

    it('returns false when isRemote is not a function', function () {
      let item = {isRemote: true};
      expect(AuthUtil.isSubjectRemote(item)).toBeFalsy();
    });

  });

});
