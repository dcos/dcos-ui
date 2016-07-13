jest.dontMock('../../constants/ServiceImages');

var ServiceImages = require('../../constants/ServiceImages');
var UniversePackage = require('../UniversePackage');

describe('UniversePackage', function () {

  describe('#getIcons', function () {

    it('returns a hash of icons', function () {
      var pkg = new UniversePackage({
        'resource': {
          'images': {
            'icon-small': 'small.png',
            'icon-medium': 'medium.png',
            'icon-large': 'large.png'
          }
        }
      });
      expect(pkg.getIcons()).toEqual({
        'icon-small': 'small.png',
        'icon-medium': 'medium.png',
        'icon-large': 'large.png'
      });
    });

    it('returns a default icons when "resources" are is empty', function () {
      var pkg = new UniversePackage({'resources': {}});
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it('returns a default icons with an empty object', function () {
      var pkg = new UniversePackage({});
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

    it('returns a default icons with no parameters', function () {
      var pkg = new UniversePackage();
      expect(pkg.getIcons()).toEqual(ServiceImages.NA_IMAGES);
    });

  });

  describe('#isSelected', function () {
    it('returns true if package is selected', function () {
      var pkg = new UniversePackage({'selected': true});
      expect(pkg.isSelected()).toEqual(true);
    });

    it('returns false if package is not selected', function () {
      var pkg = new UniversePackage({'selected': false});
      expect(pkg.isSelected()).toEqual(false);
    });
  });

  describe('#getMaintainer', function () {
    it('returns correct value', function () {
      var pkg = new UniversePackage({maintainer: 'hellothere'});
      expect(pkg.getMaintainer()).toEqual('hellothere');
    });

    it('returns null if there is no maintainer info', function () {
      var pkg = new UniversePackage({});
      expect(pkg.getMaintainer()).toEqual(undefined);
    });
  });
});
