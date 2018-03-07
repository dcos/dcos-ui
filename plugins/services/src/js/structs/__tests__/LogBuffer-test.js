const Item = require("#SRC/js/structs/Item");
const List = require("#SRC/js/structs/List");
const LogBuffer = require("../LogBuffer");

const PAGE_SIZE = 8 * 4096; // 32kb of data or 8 'pages'

let thisLogBuffer, thisOriginalAdd;

describe("LogBuffer", function() {
  beforeEach(function() {
    thisLogBuffer = new LogBuffer();
  });

  describe("#constructor", function() {
    it("creates instances of Item", function() {
      const logBuffer = new LogBuffer({ items: [{ foo: "bar" }] });
      const items = logBuffer.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });

    it("uses default end option if nothing is provided", function() {
      expect(thisLogBuffer.getEnd()).toEqual(-1);
    });

    it("uses default initialized option if nothing is provided", function() {
      expect(thisLogBuffer.isInitialized()).toEqual(false);
    });

    it("uses default start option if nothing is provided", function() {
      expect(thisLogBuffer.getStart()).toEqual(-1);
    });

    it("uses default maxFileSize option if nothing is provided", function() {
      expect(thisLogBuffer.configuration.maxFileSize).toEqual(250000000);
    });

    it("uses default end option if nothing is provided", function() {
      thisLogBuffer = new LogBuffer({ end: 2000 });
      expect(thisLogBuffer.getEnd()).toEqual(2000);
    });

    it("uses default initialized option if nothing is provided", function() {
      thisLogBuffer = new LogBuffer({ initialized: true });
      expect(thisLogBuffer.isInitialized()).toEqual(true);
    });

    it("uses default start option if nothing is provided", function() {
      thisLogBuffer = new LogBuffer({ start: 0 });
      expect(thisLogBuffer.getStart()).toEqual(0);
    });

    it("uses default maxFileSize option if nothing is provided", function() {
      thisLogBuffer = new LogBuffer({ maxFileSize: 2000 });
      expect(thisLogBuffer.configuration.maxFileSize).toEqual(2000);
    });
  });

  describe("#add", function() {
    it("calls its super function", function() {
      thisOriginalAdd = List.prototype.add;
      List.prototype.add = jasmine.createSpy();

      thisLogBuffer.add(new Item({ data: "foo", offset: 100 }));
      expect(List.prototype.add).toHaveBeenCalled();

      // Reset add to original
      List.prototype.add = thisOriginalAdd;
    });

    it("adds length to get new 'end' when beginning log", function() {
      thisLogBuffer.add(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      // Explanation of what is going on in the calculation:
      // 100 + 'foo\nbar\nquis'.indexOf('\n') + 1 + 'bar\nquis'.length
      expect(thisLogBuffer.getEnd()).toEqual(100 + 3 + 1 + 8);
    });

    it("starts log at first newline when beginning log", function() {
      thisLogBuffer.add(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      // Explanation of what is going on in the calculation:
      // 100 + 'foo\nbar\nquis'.indexOf('\n') + 1
      expect(thisLogBuffer.getStart()).toEqual(100 + 3 + 1);
    });

    it("starts log at end - maxFileSize when beginning log", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 10 });
      logBuffer.add(
        new Item({
          data: "foo\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 100
        })
      );
      // Explanation of what is going on in the calculation:
      // 100 + 'foo\nbar\nquisfoofoofoofoofoofoofoofoofoofoofoofoo'.length -
      // 'foo'.length
      expect(logBuffer.getStart()).toEqual(logBuffer.getEnd() - 3);
    });

    it("adds length to get new 'end' during logging", function() {
      thisLogBuffer.add(new Item({ data: "foo", offset: 100 }));
      thisLogBuffer.add(new Item({ data: "\nbar\nquis", offset: 103 }));
      expect(thisLogBuffer.getEnd()).toEqual(103 + "\nbar\nquis".length);
    });

    it("starts log at first offset when file < maxFileSize", function() {
      thisLogBuffer.add(new Item({ data: "foo", offset: 100 }));
      thisLogBuffer.add(new Item({ data: "\nbar\nquis", offset: 103 }));
      expect(thisLogBuffer.getStart()).toEqual(100);
    });

    it("starts log at end - maxFileSize during logging", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 10 });
      logBuffer.add(new Item({ data: "foo", offset: 100 }));
      logBuffer.add(
        new Item({
          data: "\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 103
        })
      );
      // Explanation of what is going on in the calculation:
      // 103 + '\nbar\nquisfoofoofoofoofoofoofoofoofoofoofoofoo'.length -
      // 'foo'.length
      expect(logBuffer.getStart()).toEqual(logBuffer.getEnd() - 3);
    });

    it("cuts the first item when not within maxFileSize", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 10 });
      logBuffer.add(new Item({ data: "foo", offset: 100 }));
      logBuffer.add(new Item({ data: "foo", offset: 103 }));
      logBuffer.add(
        new Item({
          data: "\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 106
        })
      );

      expect(logBuffer.getItems().length).toEqual(1);
    });

    it("keeps all items when within maxFileSize", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 200 });
      logBuffer.add(new Item({ data: "foo", offset: 100 }));
      logBuffer.add(new Item({ data: "foo", offset: 103 }));
      logBuffer.add(
        new Item({
          data: "\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 106
        })
      );

      expect(logBuffer.getItems().length).toEqual(3);
    });
  });

  describe("#prepend", function() {
    it("subtracts length from start", function() {
      thisLogBuffer.prepend(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      expect(thisLogBuffer.getStart()).toEqual(100);
    });

    it("is able to add then prepend", function() {
      thisLogBuffer.add(new Item({ data: "foo", offset: 100 }));
      thisLogBuffer.prepend(new Item({ data: "\nbar\nquis", offset: 92 }));
      expect(thisLogBuffer.getEnd()).toEqual(103);
      expect(thisLogBuffer.getStart()).toEqual(92);
    });

    it("handles truncate correctly", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 10 });
      logBuffer.prepend(
        new Item({
          data: "foo\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 100
        })
      );
      expect(logBuffer.getStart()).toEqual(logBuffer.getEnd() - 3);
    });

    it("handles truncate correctly after adding", function() {
      const logBuffer = new LogBuffer({ maxFileSize: 10 });
      logBuffer.add(new Item({ data: "foo", offset: 100 }));
      logBuffer.prepend(
        new Item({
          data: "foo\nbarquisfoofoofoofoofoofoofoofoofoofoofoo\nfoo",
          offset: 52
        })
      );
      expect(logBuffer.getStart()).toEqual(logBuffer.getEnd() - 3);
    });
  });

  describe("#initialize", function() {
    it("sets end to 0 if offset < PAGE_SIZE", function() {
      thisLogBuffer.initialize(100);
      expect(thisLogBuffer.getEnd()).toEqual(0);
    });

    it("sets start to 0 if offset < PAGE_SIZE", function() {
      thisLogBuffer.initialize(100);
      expect(thisLogBuffer.getStart()).toEqual(0);
    });

    it("sets end to offset - PAGE_SIZE when > PAGE_SIZE", function() {
      thisLogBuffer.initialize(PAGE_SIZE + 100);
      expect(thisLogBuffer.getEnd()).toEqual(100);
    });

    it("sets start to offset - PAGE_SIZE when > PAGE_SIZE", function() {
      thisLogBuffer.initialize(PAGE_SIZE + 100);
      expect(thisLogBuffer.getStart()).toEqual(100);
    });
  });

  describe("#getFullLog", function() {
    it("returns empty string when no items", function() {
      expect(thisLogBuffer.getFullLog()).toEqual("");
    });

    it("returns data items when it holds items", function() {
      thisLogBuffer.add(new Item({ data: "foo", offset: 100 }));
      thisLogBuffer.add(new Item({ data: "bar", offset: 103 }));
      thisLogBuffer.add(new Item({ data: "quis", offset: 107 }));
      expect(thisLogBuffer.getFullLog()).toEqual("foobarquis");
    });
  });
});
