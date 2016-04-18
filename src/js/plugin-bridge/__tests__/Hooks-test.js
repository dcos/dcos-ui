jest.dontMock('../Hooks');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/EventTypes');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/ConfigActions');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../stores/ConfigStore');

var Hooks = require('../Hooks');

describe('HooksAPI', function () {

  describe('#applyFilter', function () {

    beforeEach(function () {
      this.fakeFilter = jest.genMockFunction();
      this.fakeFilter.mockImplementation(function (value) {
        return value.replace('bar', 'baz');
      });

      Hooks.addFilter('foo', this.fakeFilter);

      this.filteredContent = Hooks.applyFilter('foo', 'foo bar', 'qux');
    });

    it('should receive the arguments that we defined', function () {
      expect(this.fakeFilter.mock.calls[0]).toEqual(['foo bar', 'qux']);
    });

    it('should call the filter once', function () {
      expect(this.fakeFilter.mock.calls.length).toEqual(1);
    });

    it('should return the filtered content when a filter is applied',
      function () {
      expect(this.filteredContent).toEqual('foo baz');
    });

    it('should apply the filters in the order of priority', function () {
      var lowPriorityFilter = jest.genMockFunction();
      var highPriorityFilter = jest.genMockFunction();

      lowPriorityFilter.mockImplementation(function (value) {
        return value.replace('bar', 'baz');
      });

      highPriorityFilter.mockImplementation(function (value) {
        return value.replace('bar', 'qux');
      });

      Hooks.addFilter('corge', lowPriorityFilter, 20);
      Hooks.addFilter('corge', highPriorityFilter, 1);

      var filteredContent = Hooks.applyFilter('corge', 'foo bar');

      expect(filteredContent).toEqual('foo qux');
    });

  });

  describe('#doAction', function () {

    beforeEach(function () {
      this.fakeAction = jest.genMockFunction();
      Hooks.addAction('foo', this.fakeAction);
    });

    it('should be called only once when an action is performed', function () {
      Hooks.doAction('foo', 'bar');
      expect(this.fakeAction.mock.calls.length).toEqual(1);
    });

    it('should receive arguments when an action is performed', function () {
      Hooks.doAction('foo', 'bar');
      expect(this.fakeAction.mock.calls[0][0]).toEqual('bar');
    });

    it('should not receive arguments when arguments are not passed',
      function () {
      this.noArgumentsAction = jest.genMockFunction();
      Hooks.addAction('qux', this.noArgumentsAction);
      Hooks.doAction('qux');
      expect(this.noArgumentsAction.mock.calls[0].length).toEqual(0);
    });

    it('should receive two arguments when two arguments are passed',
      function () {
      this.twoArgumentsAction = jest.genMockFunction();
      Hooks.addAction('quux', this.twoArgumentsAction);
      Hooks.doAction('quux', 'baz', 'bar');
      expect(this.twoArgumentsAction.mock.calls[0].length).toEqual(2);
    });

  });

});
