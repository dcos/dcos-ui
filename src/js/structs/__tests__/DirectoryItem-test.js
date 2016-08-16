jest.dontMock('../DirectoryItem');

const DirectoryItem = require('../DirectoryItem');

describe('DirectoryItem', function () {

  describe('#getName', function () {
    it('returns the last name in the path', function () {
      let directoryItem = new DirectoryItem({path: '/foo/bar/quis/lo'});
      expect(directoryItem.getName()).toEqual('lo');
    });

    it('returns empty string when path ends with \'/\'', function () {
      let directoryItem = new DirectoryItem({path: '/foo/bar/quis/lo/'});
      expect(directoryItem.getName()).toEqual('');
    });
  });

  describe('#isDirectory', function () {

    it('returns false when nlink is not present', function () {
      let directoryItem = new DirectoryItem({});
      expect(directoryItem.isDirectory()).toEqual(false);
    });

    it('returns false when nlink is 1 or below', function () {
      let directoryItem = new DirectoryItem({nlink: 1});
      expect(directoryItem.isDirectory()).toEqual(false);
    });

    it('returns false when nlink is 2 or above', function () {
      let directoryItem = new DirectoryItem({nlink: 2});
      expect(directoryItem.isDirectory()).toEqual(true);
    });

  });

});
