const Hooks = require("../Hooks");

let thisFakeFilter,
  thisHooks,
  thisFilteredContent,
  thisFakeAction,
  thisNoArgumentsAction,
  thisTwoArgumentsAction;

describe("HooksAPI", function() {
  describe("#applyFilter", function() {
    beforeEach(function() {
      thisFakeFilter = jest.genMockFunction();
      thisFakeFilter.mockImplementation(function(value) {
        return value.replace("bar", "baz");
      });

      thisHooks = new Hooks();
      thisHooks.addFilter("foo", thisFakeFilter);

      thisFilteredContent = thisHooks.applyFilter("foo", "foo bar", "qux");
    });

    it("receives the arguments that we defined", function() {
      expect(thisFakeFilter.mock.calls[0]).toEqual(["foo bar", "qux"]);
    });

    it("calls the filter once", function() {
      expect(thisFakeFilter.mock.calls.length).toEqual(1);
    });

    it("returns the filtered content when a filter is applied", function() {
      expect(thisFilteredContent).toEqual("foo baz");
    });

    it("applies the filters in the order of priority", function() {
      var lowPriorityFilter = jest.genMockFunction();
      var highPriorityFilter = jest.genMockFunction();

      lowPriorityFilter.mockImplementation(function(value) {
        return value.replace("bar", "baz");
      });

      highPriorityFilter.mockImplementation(function(value) {
        return value.replace("bar", "qux");
      });

      thisHooks.addFilter("corge", lowPriorityFilter, 20);
      thisHooks.addFilter("corge", highPriorityFilter, 1);

      var filteredContent = thisHooks.applyFilter("corge", "foo bar");

      expect(filteredContent).toEqual("foo qux");
    });
  });

  describe("#doAction", function() {
    beforeEach(function() {
      thisHooks = new Hooks();
      thisFakeAction = jest.genMockFunction();
      thisHooks.addAction("foo", thisFakeAction);
    });

    it("is called only once when an action is performed", function() {
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction.mock.calls.length).toEqual(1);
    });

    it("receives arguments when an action is performed", function() {
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction.mock.calls[0][0]).toEqual("bar");
    });

    it("does not receive arguments when arguments are not passed", function() {
      thisNoArgumentsAction = jest.genMockFunction();
      thisHooks.addAction("qux", thisNoArgumentsAction);
      thisHooks.doAction("qux");
      expect(thisNoArgumentsAction.mock.calls[0].length).toEqual(0);
    });

    it("receives two arguments when two arguments are passed", function() {
      thisTwoArgumentsAction = jest.genMockFunction();
      thisHooks.addAction("quux", thisTwoArgumentsAction);
      thisHooks.doAction("quux", "baz", "bar");
      expect(thisTwoArgumentsAction.mock.calls[0].length).toEqual(2);
    });
  });

  describe("#removeAction", function() {
    beforeEach(function() {
      thisHooks = new Hooks();
      thisFakeAction = jasmine.createSpy("fakeAction");
      thisHooks.addAction("foo", thisFakeAction);
    });

    it("doesn't be called after action is removed", function() {
      thisHooks.removeAction("foo", thisFakeAction);
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction).not.toHaveBeenCalled();
    });

    it("is called when action has not been removed", function() {
      thisHooks.doAction("foo", "bar");
      thisHooks.removeAction("foo", thisFakeAction);
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction.calls.count()).toEqual(1);
    });

    it("removes all instances of the listener", function() {
      thisHooks.addAction("foo", thisFakeAction, 20);
      thisHooks.addAction("foo", thisFakeAction, 30);
      thisHooks.addAction("foo", thisFakeAction, 40);
      thisHooks.removeAction("foo", thisFakeAction);
      thisHooks.doAction("foo", "bar");
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction.calls.count()).toEqual(0);
    });

    it("doesn't remove other listeners", function() {
      const fakeAction2 = jasmine.createSpy("fakeAction");
      thisHooks.addAction("foo", fakeAction2);
      thisHooks.removeAction("foo", thisFakeAction);
      thisHooks.doAction("foo", "bar");
      expect(thisFakeAction.calls.count()).toEqual(0);
      expect(fakeAction2.calls.count()).toEqual(1);
    });

    it("doesn't skip other listeners when removing current listener", function() {
      const fakeAction2 = () => {
        thisHooks.removeAction("foo", fakeAction2);
      };
      thisHooks.addAction("foo", fakeAction2);
      const fakeAction3 = jasmine.createSpy("fakeAction3");
      thisHooks.addAction("foo", fakeAction3);
      thisHooks.doAction("foo", "bar");
      expect(fakeAction3.calls.count()).toEqual(1);
    });
  });

  describe("#removeFilter", function() {
    beforeEach(function() {
      thisHooks = new Hooks();
      thisFakeFilter = jasmine.createSpy("fakeFilter");
      thisHooks.addFilter("foo", thisFakeFilter);
    });

    it("doesn't be called after filter is removed", function() {
      thisHooks.removeFilter("foo", thisFakeFilter);
      thisHooks.applyFilter("foo", "bar");
      expect(thisFakeFilter).not.toHaveBeenCalled();
    });

    it("is called when filter has not been removed", function() {
      thisHooks.applyFilter("foo", "bar");
      thisHooks.removeFilter("foo", thisFakeFilter);
      thisHooks.applyFilter("foo", "bar");
      expect(thisFakeFilter.calls.count()).toEqual(1);
    });

    it("removes all instances of the listener", function() {
      thisHooks.addFilter("foo", thisFakeFilter, 20);
      thisHooks.addFilter("foo", thisFakeFilter, 30);
      thisHooks.addFilter("foo", thisFakeFilter, 40);
      thisHooks.removeFilter("foo", thisFakeFilter);
      thisHooks.applyFilter("foo", "bar");
      thisHooks.applyFilter("foo", "bar");
      expect(thisFakeFilter.calls.count()).toEqual(0);
    });

    it("doesn't remove other listeners", function() {
      const fakeFilter2 = jasmine.createSpy("fakeFilter");
      thisHooks.addFilter("foo", fakeFilter2);
      thisHooks.removeFilter("foo", thisFakeFilter);
      thisHooks.applyFilter("foo", "bar");
      expect(thisFakeFilter.calls.count()).toEqual(0);
      expect(fakeFilter2.calls.count()).toEqual(1);
    });

    it("doesn't skip other listeners when removing current listener", function() {
      const fakeAction2 = () => {
        thisHooks.removeFilter("foo", fakeAction2);
      };
      thisHooks.addFilter("foo", fakeAction2);
      const fakeAction3 = jasmine.createSpy("fakeAction3");
      thisHooks.addFilter("foo", fakeAction3);
      thisHooks.applyFilter("foo", "bar");
      expect(fakeAction3.calls.count()).toEqual(1);
    });
  });
});
