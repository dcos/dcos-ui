jest.dontMock("../JSONUtil");

const JSONUtil = require("../JSONUtil");

describe("JSONUtil", function() {
  describe("#getObjectInformation", function() {
    describe("Empty Object", function() {
      it("should handle empty objects", function() {
        var code = "{}";
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([]);
      });

      it("should tolerate whitespaces before root object", function() {
        var code = "    \t        \n \t   \t\n\t  {}";
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([]);
      });

      it("should tolerate whitespaces after root object", function() {
        var code = "{}    \t        \n \t   \t\n\t  ";
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([]);
      });
    });

    describe("JSON Sanity Checks", function() {
      it("should raise exception on invalid JSON content", function() {
        var code = "A random {text} that has [nothing to do] with JSON!";
        expect(function() {
          JSONUtil.getObjectInformation(code);
        }).toThrow();
      });

      it("should raise exception on incomplete JSON objects", function() {
        var code = '{\n"name": {\n\t"value": 1\n\t}';
        expect(function() {
          JSONUtil.getObjectInformation(code);
        }).toThrow();
      });

      it("should raise exception on non-quoted keys", function() {
        var code = '{\nkey: "value"\n}';
        expect(function() {
          JSONUtil.getObjectInformation(code);
        }).toThrow();
      });

      it("should raise exception on wrong keys (numeric)", function() {
        var code = '{\n929: "value"\n}';
        expect(function() {
          JSONUtil.getObjectInformation(code);
        }).toThrow();
      });

      it("should raise exception on wrong keys (invalid characters)", function() {
        var code = '{\nkf@492!2$: "value"\n}';
        expect(function() {
          JSONUtil.getObjectInformation(code);
        }).toThrow();
      });
    });

    describe("Simple Primitives", function() {
      it("should handle string values", function() {
        var code = '{\n"name": "value"\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: "value",
            position: [10, 17]
          }
        ]);
      });

      it("should handle numeric values", function() {
        var code = '{\n"name": 1\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: 1,
            position: [10, 11]
          }
        ]);
      });

      it("should handle `null` values", function() {
        var code = '{\n"name": null\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: null,
            position: [10, 14]
          }
        ]);
      });

      it("should handle `true` values", function() {
        var code = '{\n"name": true\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: true,
            position: [10, 14]
          }
        ]);
      });

      it("should handle `false` values", function() {
        var code = '{\n"name": false\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: false,
            position: [10, 15]
          }
        ]);
      });
    });

    describe("Corner Cases", function() {
      it("should handle repeated keys", function() {
        var code = '{\n"name": 1,\n"name": 2\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: 1,
            position: [10, 11]
          },
          {
            path: ["name"],
            line: 3,
            type: "literal",
            value: 2,
            position: [21, 22]
          }
        ]);
      });

      it("should handle more than one keys on the same line", function() {
        var code = '{\n"name": 1, "nome": 2\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: 1,
            position: [10, 11]
          },
          {
            path: ["nome"],
            line: 2,
            type: "literal",
            value: 2,
            position: [21, 22]
          }
        ]);
      });

      it("should handle repeated keys on the same line", function() {
        var code = '{\n"name": 1, "name": 2\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: 1,
            position: [10, 11]
          },
          {
            path: ["name"],
            line: 2,
            type: "literal",
            value: 2,
            position: [21, 22]
          }
        ]);
      });
    });

    describe("Objects & Nesting", function() {
      it("should handle single level-1 object nesting", function() {
        var code = '{\n"name": {\n\t"child": 1\n\t}\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "object",
            position: [10, 26]
          },
          {
            path: ["name", "child"],
            line: 3,
            type: "literal",
            value: 1,
            position: [22, 23]
          }
        ]);
      });

      it("should handle single level-2 object nesting", function() {
        var code = '{\n"name": {\n\t"child": {\n\t\t"value": 1\n\t\t}\n\t}\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "object",
            position: [10, 43]
          },
          {
            path: ["name", "child"],
            line: 3,
            type: "object",
            position: [22, 40]
          },
          {
            path: ["name", "child", "value"],
            line: 4,
            type: "literal",
            value: 1,
            position: [35, 36]
          }
        ]);
      });

      it("should handle objects with multiple keys", function() {
        var code = '{\n"key1": 1,\n"key2": 2,\n"key3": 3}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["key1"],
            line: 2,
            type: "literal",
            value: 1,
            position: [10, 11]
          },
          {
            path: ["key2"],
            line: 3,
            type: "literal",
            value: 2,
            position: [21, 22]
          },
          {
            path: ["key3"],
            line: 4,
            type: "literal",
            value: 3,
            position: [32, 33]
          }
        ]);
      });

      it("should handle objects with multiple value types", function() {
        var code =
          '{\n"key1": "string",\n"key2": 2,\n"key3": false,\n"key4": true,\n"key5": null\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["key1"],
            line: 2,
            type: "literal",
            value: "string",
            position: [10, 18]
          },
          {
            path: ["key2"],
            line: 3,
            type: "literal",
            value: 2,
            position: [28, 29]
          },
          {
            path: ["key3"],
            line: 4,
            type: "literal",
            value: false,
            position: [39, 44]
          },
          {
            path: ["key4"],
            line: 5,
            type: "literal",
            value: true,
            position: [54, 58]
          },
          {
            path: ["key5"],
            line: 6,
            type: "literal",
            value: null,
            position: [68, 72]
          }
        ]);
      });

      it("should handle multiple objects with multiple keys", function() {
        var code =
          '{\n"obj1": {\n"key1": 1,\n"key2": 2\n}, "obj2": {\n"key3": 1,\n"key4": 2\n}, "obj3": {\n"key5": 1,\n"key6": 2\n}\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["obj1"],
            line: 2,
            type: "object",
            position: [10, 34]
          },
          {
            path: ["obj1", "key1"],
            line: 3,
            type: "literal",
            value: 1,
            position: [20, 21]
          },
          {
            path: ["obj1", "key2"],
            line: 4,
            type: "literal",
            value: 2,
            position: [31, 32]
          },
          {
            path: ["obj2"],
            line: 5,
            type: "object",
            position: [44, 68]
          },
          {
            path: ["obj2", "key3"],
            line: 6,
            type: "literal",
            value: 1,
            position: [54, 55]
          },
          {
            path: ["obj2", "key4"],
            line: 7,
            type: "literal",
            value: 2,
            position: [65, 66]
          },
          {
            path: ["obj3"],
            line: 8,
            type: "object",
            position: [78, 102]
          },
          {
            path: ["obj3", "key5"],
            line: 9,
            type: "literal",
            value: 1,
            position: [88, 89]
          },
          {
            path: ["obj3", "key6"],
            line: 10,
            type: "literal",
            value: 2,
            position: [99, 100]
          }
        ]);
      });
    });

    describe("Arrays & Nesting", function() {
      it("should handle values in arrays", function() {
        var code = '{\n"name": [\n\t"child"\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 23]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "literal",
            value: "child",
            position: [13, 20]
          }
        ]);
      });

      it("should handle objects in arrays", function() {
        var code = '{\n"name": [\n\t{"child": 1}\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 28]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "object",
            position: [13, 25]
          },
          {
            path: ["name", 0, "child"],
            line: 3,
            type: "literal",
            value: 1,
            position: [23, 24]
          }
        ]);
      });

      it("should handle values in level-1 nested arrays", function() {
        var code = '{\n"name": [\n\t[\n\t\t"child"\n\t\t]\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 31]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "array",
            position: [13, 28]
          },
          {
            path: ["name", 0, 0],
            line: 4,
            type: "literal",
            value: "child",
            position: [17, 24]
          }
        ]);
      });

      it("should handle objects in level-1 nested arrays", function() {
        var code = '{\n"name": [\n\t[{"child": 1}]\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 30]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "array",
            position: [13, 27]
          },
          {
            path: ["name", 0, 0],
            line: 3,
            type: "object",
            position: [14, 26]
          },
          {
            path: ["name", 0, 0, "child"],
            line: 3,
            type: "literal",
            value: 1,
            position: [24, 25]
          }
        ]);
      });

      it("should handle values in level-2 nested arrays", function() {
        var code = '{\n"name": [\n\t[\n\t\t["child"]\n\t\t]\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 33]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "array",
            position: [13, 30]
          },
          {
            path: ["name", 0, 0],
            line: 4,
            type: "array",
            position: [17, 26]
          },
          {
            path: ["name", 0, 0, 0],
            line: 4,
            type: "literal",
            value: "child",
            position: [18, 25]
          }
        ]);
      });

      it("should handle objects in level-2 nested arrays", function() {
        var code = '{\n"name": [\n\t[\n\t\t[{"child": 1}]\n\t\t]\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 38]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "array",
            position: [13, 35]
          },
          {
            path: ["name", 0, 0],
            line: 4,
            type: "array",
            position: [17, 31]
          },
          {
            path: ["name", 0, 0, 0],
            line: 4,
            type: "object",
            position: [18, 30]
          },
          {
            path: ["name", 0, 0, 0, "child"],
            line: 4,
            type: "literal",
            value: 1,
            position: [28, 29]
          }
        ]);
      });
    });

    describe("Nixed Nesting", function() {
      it("should handle nesting objects and arrays", function() {
        var code =
          '{\n"name": [\n\t{\n\t\t"child": [\n\t\t\t{"value":1}\n\t\t]\n\t\t}\n\t]\n}';
        var objects = JSONUtil.getObjectInformation(code);
        expect(objects).toEqual([
          {
            path: ["name"],
            line: 2,
            type: "array",
            position: [10, 53]
          },
          {
            path: ["name", 0],
            line: 3,
            type: "object",
            position: [13, 50]
          },
          {
            path: ["name", 0, "child"],
            line: 4,
            type: "array",
            position: [26, 46]
          },
          {
            path: ["name", 0, "child", 0],
            line: 5,
            type: "object",
            position: [31, 42]
          },
          {
            path: ["name", 0, "child", 0, "value"],
            line: 5,
            type: "literal",
            value: 1,
            position: [40, 41]
          }
        ]);
      });
    });
  });
});
