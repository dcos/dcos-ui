jest.dontMock('../TabsUtil');

var _ = require('underscore');

var TabsUtil = require('../TabsUtil');

describe('TabsUtil', function () {
  describe('#getTabs', function () {
    beforeEach(function () {
      this.tabs = {foo: 'bar', baz: 'qux', corge: 'grault'};
      this.getElement = function () {};
      spyOn(this, 'getElement');
    });

    it('should return an empty array when given an empty object', function () {
      var result = TabsUtil.getTabs({}, null, this.getElement);

      expect(this.getElement).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return equal length array to what is given', function () {
      var result = TabsUtil.getTabs(this.tabs, 'baz', this.getElement);

      expect(this.getElement.callCount).toEqual(3);
      expect(result.length).toEqual(3);
    });

    it('should return li\'s', function () {
      var result = TabsUtil.getTabs(this.tabs, 'baz', this.getElement);

      expect(result[0].type).toEqual('li');
      expect(result[1].type).toEqual('li');
      expect(result[2].type).toEqual('li');
    });

    it('should return element\'s with one active class', function () {
      var result = TabsUtil.getTabs(this.tabs, 'baz', this.getElement);

      expect(result[0].props.className).toEqual('tab-item');
      expect(result[1].props.className).toEqual('tab-item active');
      expect(result[2].props.className).toEqual('tab-item');
    });

    it('should call getElement with appropriate arguments', function () {
      TabsUtil.getTabs(this.tabs, 'baz', this.getElement);

      expect(this.getElement.argsForCall).toEqual([
        ['foo', 0],
        ['baz', 1],
        ['corge', 2]
      ]);
    });

    it('should throw an error when tabs is null', function () {
      var fn = TabsUtil.getTabs.bind(null, null, 'baz', _.noop);

      expect(fn).toThrow();
    });

    it('should throw an error when tabs is undefined', function () {
      var fn = TabsUtil.getTabs.bind(null, undefined, 'baz', _.noop);

      expect(fn).toThrow();
    });

    it('should not have an active route when it doesn\'t exist', function () {
      TabsUtil.getTabs(this.tabs, 'notHere', this.getElement);

      expect(this.getElement.argsForCall).toEqual([
        ['foo', 0],
        ['baz', 1],
        ['corge', 2]
      ]);
    });
  });

  describe('#sortTabs', function () {
    beforeEach(function () {
      this.tabs = {
        foo: {
          content: 'foo',
          priority: 20
        },
        bar: {
          content: 'bar',
          priority: 30
        },
        qux: {
          content: 'qux',
          priority: 10
        }
      };
    });

    it('should arrange tabs in correct order', function () {
      var sortedTabs = TabsUtil.sortTabs(this.tabs);
      var tabContent = Object.keys(sortedTabs);
      expect(tabContent).toEqual(['bar', 'foo', 'qux']);
    });

  });
});
