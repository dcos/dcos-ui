jest.dontMock("../Hooks");

const Hooks = require("../Hooks");

describe("HooksAPI", function() {
  describe("#applyFilter", function() {
    beforeEach(function() {
      this.fakeFilter = jest.genMockFunction();
      this.fakeFilter.mockImplementation(function(value) {
        return value.replace("bar", "baz");
      });

      this.hooks = new Hooks();
      this.hooks.addFilter("foo", this.fakeFilter);

      this.filteredContent = this.hooks.applyFilter("foo", "foo bar", "qux");
    });

    it("should receive the arguments that we defined", function() {
      expect(this.fakeFilter.mock.calls[0]).toEqual(["foo bar", "qux"]);
    });

    it("should call the filter once", function() {
      expect(this.fakeFilter.mock.calls.length).toEqual(1);
    });

    it("should return the filtered content when a filter is applied", function() {
      expect(this.filteredContent).toEqual("foo baz");
    });

    it("should apply the filters in the order of priority", function() {
      var lowPriorityFilter = jest.genMockFunction();
      var highPriorityFilter = jest.genMockFunction();

      lowPriorityFilter.mockImplementation(function(value) {
        return value.replace("bar", "baz");
      });

      highPriorityFilter.mockImplementation(function(value) {
        return value.replace("bar", "qux");
      });

      this.hooks.addFilter("corge", lowPriorityFilter, 20);
      this.hooks.addFilter("corge", highPriorityFilter, 1);

      var filteredContent = this.hooks.applyFilter("corge", "foo bar");

      expect(filteredContent).toEqual("foo qux");
    });
  });

  describe("#doAction", function() {
    beforeEach(function() {
      this.hooks = new Hooks();
      this.fakeAction = jest.genMockFunction();
      this.hooks.addAction("foo", this.fakeAction);
    });

    it("should be called only once when an action is performed", function() {
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction.mock.calls.length).toEqual(1);
    });

    it("should receive arguments when an action is performed", function() {
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction.mock.calls[0][0]).toEqual("bar");
    });

    it("should not receive arguments when arguments are not passed", function() {
      this.noArgumentsAction = jest.genMockFunction();
      this.hooks.addAction("qux", this.noArgumentsAction);
      this.hooks.doAction("qux");
      expect(this.noArgumentsAction.mock.calls[0].length).toEqual(0);
    });

    it("should receive two arguments when two arguments are passed", function() {
      this.twoArgumentsAction = jest.genMockFunction();
      this.hooks.addAction("quux", this.twoArgumentsAction);
      this.hooks.doAction("quux", "baz", "bar");
      expect(this.twoArgumentsAction.mock.calls[0].length).toEqual(2);
    });
  });

  describe("#removeAction", function() {
    beforeEach(function() {
      this.hooks = new Hooks();
      this.fakeAction = jasmine.createSpy("fakeAction");
      this.hooks.addAction("foo", this.fakeAction);
    });

    it("shouldn't be called after action is removed", function() {
      this.hooks.removeAction("foo", this.fakeAction);
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction).not.toHaveBeenCalled();
    });

    it("should be called when action has not been removed", function() {
      this.hooks.doAction("foo", "bar");
      this.hooks.removeAction("foo", this.fakeAction);
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction.calls.count()).toEqual(1);
    });

    it("removes all instances of the listener", function() {
      this.hooks.addAction("foo", this.fakeAction, 20);
      this.hooks.addAction("foo", this.fakeAction, 30);
      this.hooks.addAction("foo", this.fakeAction, 40);
      this.hooks.removeAction("foo", this.fakeAction);
      this.hooks.doAction("foo", "bar");
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction.calls.count()).toEqual(0);
    });

    it("doesn't remove other listeners", function() {
      const fakeAction2 = jasmine.createSpy("fakeAction");
      this.hooks.addAction("foo", fakeAction2);
      this.hooks.removeAction("foo", this.fakeAction);
      this.hooks.doAction("foo", "bar");
      expect(this.fakeAction.calls.count()).toEqual(0);
      expect(fakeAction2.calls.count()).toEqual(1);
    });

    it("doesn't skip other listeners when removing current listener", function() {
      const fakeAction2 = () => {
        this.hooks.removeAction("foo", fakeAction2);
      };
      this.hooks.addAction("foo", fakeAction2);
      const fakeAction3 = jasmine.createSpy("fakeAction3");
      this.hooks.addAction("foo", fakeAction3);
      this.hooks.doAction("foo", "bar");
      expect(fakeAction3.calls.count()).toEqual(1);
    });
  });

  describe("#removeFilter", function() {
    beforeEach(function() {
      this.hooks = new Hooks();
      this.fakeFilter = jasmine.createSpy("fakeFilter");
      this.hooks.addFilter("foo", this.fakeFilter);
    });

    it("shouldn't be called after filter is removed", function() {
      this.hooks.removeFilter("foo", this.fakeFilter);
      this.hooks.applyFilter("foo", "bar");
      expect(this.fakeFilter).not.toHaveBeenCalled();
    });

    it("should be called when filter has not been removed", function() {
      this.hooks.applyFilter("foo", "bar");
      this.hooks.removeFilter("foo", this.fakeFilter);
      this.hooks.applyFilter("foo", "bar");
      expect(this.fakeFilter.calls.count()).toEqual(1);
    });

    it("removes all instances of the listener", function() {
      this.hooks.addFilter("foo", this.fakeFilter, 20);
      this.hooks.addFilter("foo", this.fakeFilter, 30);
      this.hooks.addFilter("foo", this.fakeFilter, 40);
      this.hooks.removeFilter("foo", this.fakeFilter);
      this.hooks.applyFilter("foo", "bar");
      this.hooks.applyFilter("foo", "bar");
      expect(this.fakeFilter.calls.count()).toEqual(0);
    });

    it("doesn't remove other listeners", function() {
      const fakeFilter2 = jasmine.createSpy("fakeFilter");
      this.hooks.addFilter("foo", fakeFilter2);
      this.hooks.removeFilter("foo", this.fakeFilter);
      this.hooks.applyFilter("foo", "bar");
      expect(this.fakeFilter.calls.count()).toEqual(0);
      expect(fakeFilter2.calls.count()).toEqual(1);
    });

    it("doesn't skip other listeners when removing current listener", function() {
      const fakeAction2 = () => {
        this.hooks.removeFilter("foo", fakeAction2);
      };
      this.hooks.addFilter("foo", fakeAction2);
      const fakeAction3 = jasmine.createSpy("fakeAction3");
      this.hooks.addFilter("foo", fakeAction3);
      this.hooks.applyFilter("foo", "bar");
      expect(fakeAction3.calls.count()).toEqual(1);
    });
  });
});
