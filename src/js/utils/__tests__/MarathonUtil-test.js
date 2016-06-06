jest.dontMock('../MarathonUtil');

var MarathonUtil = require('../MarathonUtil');

describe('MarathonUtil', function () {

  describe('#parseGroups', function () {

    it('should throw error if the provided id doesn\'t start with a slash',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: 'malformed/id'});
        }.bind(this)).toThrow();
      }
    );

    it('should throw error if an app id doesn\'t start with a slash',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: '/', apps: [{id: 'malformed/id'}]});
        }.bind(this)).toThrow();
      }
    );

    it('should throw error if the provided id ends with a slash',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: '/malformed/id/'});
        }.bind(this)).toThrow();
      }
    );

    it('should throw error if an app id ends with a slash',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: '/', apps: [{id: '/malformed/id/'}]});
        }.bind(this)).toThrow();
      }
    );

    it('should not throw error if the provided id is only a slash (root id)',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: '/'});
        }.bind(this)).not.toThrow();
      }
    );

    it('should throw error if an app id is only a slash (root id)',
      function () {
        expect(function () {
          MarathonUtil.parseGroups({id: '/', apps: [{id: '/'}]});
        }.bind(this)).toThrow();
      }
    );

    it('converts groups to tree', function () {
      var instance = MarathonUtil.parseGroups({
        id: '/',
        apps: [{id: '/alpha'}],
        groups: [{id: '/foo', apps: [{id: '/foo/beta'}]}]
      });

      expect(instance).toEqual({
        id: '/',
        items: [{id: '/foo', items: [{id: '/foo/beta'}]}, {id: '/alpha'}]
      });
    });

  });

});
