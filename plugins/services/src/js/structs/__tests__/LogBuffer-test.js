const Item = require("#SRC/js/structs/Item");
const List = require("#SRC/js/structs/List");
const LogBuffer = require("../LogBuffer");

const PAGE_SIZE = 8 * 4096; // 32kb of data or 8 'pages'

describe("LogBuffer", function() {
  beforeEach(function() {
    this.logBuffer = new LogBuffer();
  });

  describe("#constructor", function() {
    it("creates instances of Item", function() {
      const logBuffer = new LogBuffer({ items: [{ foo: "bar" }] });
      const items = logBuffer.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });

    it("uses default end option if nothing is provided", function() {
      expect(this.logBuffer.getEnd()).toEqual(-1);
    });

    it("uses default initialized option if nothing is provided", function() {
      expect(this.logBuffer.isInitialized()).toEqual(false);
    });

    it("uses default start option if nothing is provided", function() {
      expect(this.logBuffer.getStart()).toEqual(-1);
    });

    it("uses default maxFileSize option if nothing is provided", function() {
      expect(this.logBuffer.configuration.maxFileSize).toEqual(250000000);
    });

    it("uses default end option if nothing is provided", function() {
      this.logBuffer = new LogBuffer({ end: 2000 });
      expect(this.logBuffer.getEnd()).toEqual(2000);
    });

    it("uses default initialized option if nothing is provided", function() {
      this.logBuffer = new LogBuffer({ initialized: true });
      expect(this.logBuffer.isInitialized()).toEqual(true);
    });

    it("uses default start option if nothing is provided", function() {
      this.logBuffer = new LogBuffer({ start: 0 });
      expect(this.logBuffer.getStart()).toEqual(0);
    });

    it("uses default maxFileSize option if nothing is provided", function() {
      this.logBuffer = new LogBuffer({ maxFileSize: 2000 });
      expect(this.logBuffer.configuration.maxFileSize).toEqual(2000);
    });
  });

  describe("#add", function() {
    it("calls its super function", function() {
      this.originalAdd = List.prototype.add;
      List.prototype.add = jasmine.createSpy();

      this.logBuffer.add(new Item({ data: "foo", offset: 100 }));
      expect(List.prototype.add).toHaveBeenCalled();

      // Reset add to original
      List.prototype.add = this.originalAdd;
    });

    it("adds length to get new 'end' when beginning log", function() {
      this.logBuffer.add(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      // Explanation of what is going on in the calculation:
      // 100 + 'foo\nbar\nquis'.indexOf('\n') + 1 + 'bar\nquis'.length
      expect(this.logBuffer.getEnd()).toEqual(100 + 3 + 1 + 8);
    });

    it("starts log at first newline when beginning log", function() {
      this.logBuffer.add(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      // Explanation of what is going on in the calculation:
      // 100 + 'foo\nbar\nquis'.indexOf('\n') + 1
      expect(this.logBuffer.getStart()).toEqual(100 + 3 + 1);
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
      this.logBuffer.add(new Item({ data: "foo", offset: 100 }));
      this.logBuffer.add(new Item({ data: "\nbar\nquis", offset: 103 }));
      expect(this.logBuffer.getEnd()).toEqual(103 + "\nbar\nquis".length);
    });

    it("starts log at first offset when file < maxFileSize", function() {
      this.logBuffer.add(new Item({ data: "foo", offset: 100 }));
      this.logBuffer.add(new Item({ data: "\nbar\nquis", offset: 103 }));
      expect(this.logBuffer.getStart()).toEqual(100);
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
      this.logBuffer.prepend(new Item({ data: "foo\nbar\nquis", offset: 100 }));
      expect(this.logBuffer.getStart()).toEqual(100);
    });

    it("is able to add then prepend", function() {
      this.logBuffer.add(new Item({ data: "foo", offset: 100 }));
      this.logBuffer.prepend(new Item({ data: "\nbar\nquis", offset: 92 }));
      expect(this.logBuffer.getEnd()).toEqual(103);
      expect(this.logBuffer.getStart()).toEqual(92);
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
      this.logBuffer.initialize(100);
      expect(this.logBuffer.getEnd()).toEqual(0);
    });

    it("sets start to 0 if offset < PAGE_SIZE", function() {
      this.logBuffer.initialize(100);
      expect(this.logBuffer.getStart()).toEqual(0);
    });

    it("sets end to offset - PAGE_SIZE when > PAGE_SIZE", function() {
      this.logBuffer.initialize(PAGE_SIZE + 100);
      expect(this.logBuffer.getEnd()).toEqual(100);
    });

    it("sets start to offset - PAGE_SIZE when > PAGE_SIZE", function() {
      this.logBuffer.initialize(PAGE_SIZE + 100);
      expect(this.logBuffer.getStart()).toEqual(100);
    });
  });

  describe("#getFullLog", function() {
    it("returns empty string when no items", function() {
      expect(this.logBuffer.getFullLog()).toEqual("");
    });

    it("returns data items when it holds items", function() {
      this.logBuffer.add(new Item({ data: "foo", offset: 100 }));
      this.logBuffer.add(new Item({ data: "bar", offset: 103 }));
      this.logBuffer.add(new Item({ data: "quis", offset: 107 }));
      expect(this.logBuffer.getFullLog()).toEqual("foobarquis");
    });
  });
});
