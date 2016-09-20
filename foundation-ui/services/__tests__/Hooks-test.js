jest.dontMock('../Hooks');

const Hooks = require('../Hooks');

describe('HooksAPI', function () {

  describe('#applyFilter', function () {

    beforeEach(function () {
      this.fakeFilter = jest.genMockFunction();
      this.fakeFilter.mockImplementation(function (value) {
        return value.replace('bar', 'baz');
      });

      this.hooks = new Hooks();
      this.hooks.addFilter('foo', this.fakeFilter);

      this.filteredContent = this.hooks.applyFilter('foo', 'foo bar', 'qux');
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

      this.hooks.addFilter('corge', lowPriorityFilter, 20);
      this.hooks.addFilter('corge', highPriorityFilter, 1);

      var filteredContent = this.hooks.applyFilter('corge', 'foo bar');

      expect(filteredContent).toEqual('foo qux');
    });

  });

  describe('#doAction', function () {

    beforeEach(function () {
      this.hooks = new Hooks();
      this.fakeAction = jest.genMockFunction();
      this.hooks.addAction('foo', this.fakeAction);
    });

    it('should be called only once when an action is performed', function () {
      this.hooks.doAction('foo', 'bar');
      expect(this.fakeAction.mock.calls.length).toEqual(1);
    });

    it('should receive arguments when an action is performed', function () {
      this.hooks.doAction('foo', 'bar');
      expect(this.fakeAction.mock.calls[0][0]).toEqual('bar');
    });

    it('should not receive arguments when arguments are not passed',
      function () {
        this.noArgumentsAction = jest.genMockFunction();
        this.hooks.addAction('qux', this.noArgumentsAction);
        this.hooks.doAction('qux');
        expect(this.noArgumentsAction.mock.calls[0].length).toEqual(0);
      });

    it('should receive two arguments when two arguments are passed',
      function () {
        this.twoArgumentsAction = jest.genMockFunction();
        this.hooks.addAction('quux', this.twoArgumentsAction);
        this.hooks.doAction('quux', 'baz', 'bar');
        expect(this.twoArgumentsAction.mock.calls[0].length).toEqual(2);
      });

  });

});
