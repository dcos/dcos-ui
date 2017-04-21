jest.dontMock("../DSLParserUtil");
jest.dontMock("../DSLUpdateUtil");
jest.dontMock("../DSLUtil");
jest.dontMock("../../structs/DSLExpression");
jest.dontMock("../../../resources/grammar/SearchDSL.jison");

const DSLASTNodes = require("../../structs/DSLASTNodes");
const DSLCombinerTypes = require("../../constants/DSLCombinerTypes");
const DSLExpression = require("../../structs/DSLExpression");
const DSLFilterTypes = require("../../constants/DSLFilterTypes");
const DSLUpdateUtil = require("../DSLUpdateUtil");
const DSLUtil = require("../DSLUtil");

describe("DSLUpdateUtil", function() {
  describe("#cleanupExpressionString", function() {
    it("should remove extraneous whitespaces", function() {
      const expr = "foo  bar   baz ";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo bar baz");
    });

    it("should remove repeating commas", function() {
      const expr = "foo,,  bar,  , baz";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo, bar, baz");
    });

    it("should remove orphan commas (beginning)", function() {
      const expr = " ,foo bar";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo bar");
    });

    it("should remove orphan commas (ending)", function() {
      const expr = "foo bar ,";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo bar");
    });

    it("should remove orphan commas (parenthesis-left)", function() {
      const expr = "foo (, bar baz)";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo (bar baz)");
    });

    it("should remove orphan commas (parenthesis-right)", function() {
      const expr = "foo (bar baz , )";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo (bar baz)");
    });

    it("should remove orphan commas (multi-value beginning)", function() {
      const expr = "foo:,bar";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo:bar");
    });

    it("should remove orphan commas (multi-value middle)", function() {
      const expr = "foo:bar,,baz";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo:bar,baz");
    });

    it("should expand single parenthesis", function() {
      const expr = "foo (bar) baz";
      expect(DSLUpdateUtil.cleanupExpressionString(expr)).toBe("foo bar baz");
    });
  });

  describe("#updateNodeTextString", function() {
    it("should correctly update attribute nodes", function() {
      const value = "label:foo";

      const node = new DSLExpression(value).ast;
      const replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "bar"
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace)).toEqual(
        "label:bar"
      );
    });

    it("should correctly update multi-value attribute nodes", function() {
      const value = "label:foo,baz";

      const node = new DSLExpression(value).ast.children[0];
      const replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "bar"
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace)).toEqual(
        "label:bar,baz"
      );
    });

    it("should correctly update fuzzy nodes", function() {
      const value = "foo";

      const node = new DSLExpression(value).ast;
      const replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "bar"
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace)).toEqual(
        "bar"
      );
    });

    it("should correctly update exact nodes", function() {
      const value = '"foo"';

      const node = new DSLExpression(value).ast;
      const replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "bar"
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace)).toEqual(
        '"bar"'
      );
    });

    it("should respect offset", function() {
      const value = "some junk label:foo";
      const parseValue = "label:foo";

      const node = new DSLExpression(parseValue).ast;
      const replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "bar"
      });

      expect(
        DSLUpdateUtil.updateNodeTextString(value, node, replace, 10)
      ).toEqual("some junk label:bar");
    });
  });

  describe("#deleteNodeString", function() {
    it("should correctly delete attribute nodes", function() {
      const value = "some fuzz label:foo";

      const node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node)).toEqual("some fuzz");
    });

    it("should correctly delete multi-value attribute nodes", function() {
      const value = "some fuzz label:foo,bar";

      const node = new DSLExpression(value).ast.children[1].children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node)).toEqual(
        "some fuzz label:foo"
      );
    });

    it("should correctly delete fuzzy nodes", function() {
      const value = "some fuzz foo";

      const node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node)).toEqual("some fuzz");
    });

    it("should correctly delete exact nodes", function() {
      const value = 'some fuzz "foo"';

      const node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node)).toEqual("some fuzz");
    });

    it("should correctly trim whitespaces on intermediate nodes", function() {
      const value = "some fuzz foo";

      const node = new DSLExpression(value).ast.children[0].children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node)).toEqual("some foo");
    });

    it("should respect offset", function() {
      const value = "some fuzz foo";
      const parseValue = "foo";

      const node = new DSLExpression(parseValue).ast;

      expect(DSLUpdateUtil.deleteNodeString(value, node, 10)).toEqual(
        "some fuzz"
      );
    });
  });

  describe("#applyAdd", function() {
    it("should correctly add one attribute node to an expression", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value).toEqual(
        "foo bar label:text"
      );
    });

    it("should correctly add fuzzy node to an expression", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value).toEqual(
        "foo bar text"
      );
    });

    it("should correctly add exact node to an expression", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "text"
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value).toEqual(
        'foo bar "text"'
      );
    });

    it("should correctly add two attribute nodes to an expression", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node, node]).value).toEqual(
        "foo bar label:text label:text"
      );
    });

    it("should correctly add one attribute node to an expression with OR", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("foo bar, label:text");
    });

    it("should correctly add fuzzy node to an expression with OR", function() {
      const expression = new DSLExpression('"not fuzzy"');
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('"not fuzzy", text');
    });

    it("should correctly add exact node to an expression with OR", function() {
      const expression = new DSLExpression("foo bar");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "text"
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('foo bar, "text"');
    });

    it("should correctly create multi-value attribute when adding with OR", function() {
      const expression = new DSLExpression("foo bar label:some");
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("foo bar label:some,text");
    });

    it("should correctly use custom nodeCompareFunction on newCombiner", function() {
      const customComparisionFunction = function(addingNode, astNode) {
        return astNode.filterParams.text === "here";
      };

      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      let expression = new DSLExpression("label:not_here");
      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          nodeCompareFunction: customComparisionFunction,
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("label:not_here, label:text");

      expression = new DSLExpression("label:here");
      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          nodeCompareFunction: customComparisionFunction,
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("label:here,text");
    });
  });

  describe("#applyReplace", function() {
    it("should correctly replace one node", function() {
      const expression = new DSLExpression("foo bar is:working");
      const attribNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {})
      );

      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "is",
        text: "idle"
      });

      expect(
        DSLUpdateUtil.applyReplace(expression, attribNodes, [node]).value
      ).toEqual("foo bar is:idle");
    });

    it("should correctly replace more than one nodes", function() {
      const expression = new DSLExpression("some fuzzy nodes");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
          text: "here"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "can" }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "be" })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value
      ).toEqual("here can be");
    });

    it("should correctly delete excess nodes", function() {
      const expression = new DSLExpression("some fuzzy nodes that are gone");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
          text: "here"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "can" }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "be" })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value
      ).toEqual("here can be");
    });

    it("should correctly add missing nodes", function() {
      const expression = new DSLExpression("few");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
          text: "here"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "can" }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "be" })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value
      ).toEqual("here can be");
    });

    it("should correctly replace multi-value attribute nodes", function() {
      const expression = new DSLExpression("some fuzzy is:a,b,c nodes");
      const attribNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, { label: "is" })
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "one"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "of"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "many"
        })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, attribNodes, replace).value
      ).toEqual("some fuzzy is:one,of,many nodes");
    });

    it("should correctly add missing nodes using newCombiner=OR", function() {
      const expression = new DSLExpression("previous");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
          text: "here"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "can" }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "be" })
      ];

      // NOTE: We already have a fuzzy node, so `newCombiner` should not be
      //       applied to the expression.
      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("here can be");
    });

    it("should correctly add missing nodes using itemCombiner=OR", function() {
      const expression = new DSLExpression("few");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
          text: "here"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "can" }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "be" })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("here, can, be");
    });

    it("should correctly continue with OR operator if itemCombiner=OR", function() {
      const expression = new DSLExpression("some label:foo");
      const fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "label",
          text: "foo"
        })
      );

      const replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "label",
          text: "foo"
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "label",
          text: "bar"
        })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          newCombiner: DSLCombinerTypes.OR,
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual("some label:foo,bar");
    });
  });

  describe("#applyDelete", function() {
    it("should correctly delete one attribute node", function() {
      const expression = new DSLExpression("is:attribute");
      const deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        ""
      );
    });

    it("should correctly delete first in multiple attribute nodes", function() {
      const expression = new DSLExpression("is:a is:b is:c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "a"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:b is:c"
      );
    });

    it("should correctly delete last in multiple attribute nodes", function() {
      const expression = new DSLExpression("is:a is:b is:c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "c"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a is:b"
      );
    });

    it("should correctly delete internal in multiple attribute nodes", function() {
      const expression = new DSLExpression("is:a is:b is:c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "b"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a is:c"
      );
    });

    it("should correctly delete first in multi-value attribute nodes", function() {
      const expression = new DSLExpression("is:a,b,c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "a"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:b,c"
      );
    });

    it("should correctly delete internal in multi-value attribute nodes", function() {
      const expression = new DSLExpression("is:a,b,c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "b"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a,c"
      );
    });

    it("should correctly delete last in multi-value attribute nodes", function() {
      const expression = new DSLExpression("is:a,b,c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "c"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a,b"
      );
    });

    it("should correctly delete one in multiple attribute nodes", function() {
      const expression = new DSLExpression("is:a is:b, is:c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "b"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a, is:c"
      );
    });

    it("should correctly delete one in multi-value attribute node", function() {
      const expression = new DSLExpression("is:a,b,c");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "b"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a,c"
      );
    });

    it("should correctly delete one fuzzy node", function() {
      const expression = new DSLExpression("fuzz");
      const deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        ""
      );
    });

    it("should correctly delete one exact node", function() {
      const expression = new DSLExpression('"exact"');
      const deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        ""
      );
    });

    it("should correctly delete nodes between other nodes", function() {
      const expression = new DSLExpression(
        'some (fuzzy expression) "with" text'
      );
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {})
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "some (fuzzy expression) text"
      );
    });

    it("should correctly delete lingering comma operators", function() {
      const expression = new DSLExpression("some, fuzz");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, { text: "fuzz" })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "some"
      );
    });

    it('should correctly delete is:c in "is:a,b,c is:d,c"', function() {
      const expression = new DSLExpression("is:a,b,c is:d,e");
      const deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: "is",
          text: "c"
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value).toEqual(
        "is:a,b is:d,e"
      );
    });
  });

  describe("#defaultNodeCompareFunction", function() {
    it("should return false when comparing nodes of different type", function() {
      const nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: "text"
      });
      const nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(
        DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB)
      ).toBeFalsy();
    });

    it("should return true when both fuzzy regardless of text", function() {
      const nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: "text1"
      });
      const nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: "text2"
      });

      expect(
        DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB)
      ).toBeTruthy();
    });

    it("should return true when both exact regardless of text", function() {
      const nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: "text1"
      });
      const nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: "text2"
      });

      expect(
        DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB)
      ).toBeTruthy();
    });

    it("should return false when both attrib but different label", function() {
      const nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: "text1",
        label: "label1"
      });
      const nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: "text2",
        label: "label2"
      });

      expect(
        DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB)
      ).toBeFalsy();
    });

    it("should return false when both attrib and same label", function() {
      const nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: "text1",
        label: "label"
      });
      const nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: "text2",
        label: "label"
      });

      expect(
        DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB)
      ).toBeTruthy();
    });
  });
});
