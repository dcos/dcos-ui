jest.dontMock('../DSLParserUtil');
jest.dontMock('../DSLUpdateUtil');
jest.dontMock('../DSLUtil');
jest.dontMock('../../structs/DSLExpression');
jest.dontMock('../../../resources/grammar/SearchDSL.jison');

const DSLASTNodes = require('../../structs/DSLASTNodes');
const DSLCombinerTypes = require('../../constants/DSLCombinerTypes');
const DSLExpression = require('../../structs/DSLExpression');
const DSLFilterTypes = require('../../constants/DSLFilterTypes');
const DSLUpdateUtil = require('../DSLUpdateUtil');
const DSLUtil = require('../DSLUtil');

describe('DSLUpdateUtil', function () {

  describe('#updateNodeTextString', function () {

    it('should correctly update attribute nodes', function () {
      let value = 'label:foo';

      let node = new DSLExpression(value).ast;
      let replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'bar'
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace))
        .toEqual('label:bar');
    });

    it('should correctly update multi-value attribute nodes', function () {
      let value = 'label:foo,baz';

      let node = new DSLExpression(value).ast.children[0];
      let replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'bar'
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace))
        .toEqual('label:bar,baz');
    });

    it('should correctly update fuzzy nodes', function () {
      let value = 'foo';

      let node = new DSLExpression(value).ast;
      let replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: 'bar'
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace))
        .toEqual('bar');
    });

    it('should correctly update exact nodes', function () {
      let value = '"foo"';

      let node = new DSLExpression(value).ast;
      let replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: 'bar'
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace))
        .toEqual('"bar"');
    });

    it('should respect offset', function () {
      let value = 'some junk label:foo';
      let parseValue = 'label:foo';

      let node = new DSLExpression(parseValue).ast;
      let replace = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'bar'
      });

      expect(DSLUpdateUtil.updateNodeTextString(value, node, replace, 10))
        .toEqual('some junk label:bar');
    });

  });

  describe('#deleteNodeString', function () {

    it('should correctly delete attribute nodes', function () {
      let value = 'some fuzz label:foo';

      let node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node))
        .toEqual('some fuzz');
    });

    it('should correctly delete multi-value attribute nodes', function () {
      let value = 'some fuzz label:foo,bar';

      let node = new DSLExpression(value).ast.children[1].children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node))
        .toEqual('some fuzz label:foo');
    });

    it('should correctly delete fuzzy nodes', function () {
      let value = 'some fuzz foo';

      let node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node))
        .toEqual('some fuzz');
    });

    it('should correctly delete exact nodes', function () {
      let value = 'some fuzz "foo"';

      let node = new DSLExpression(value).ast.children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node))
        .toEqual('some fuzz');
    });

    it('should correctly trim whitespaces on intermediate nodes', function () {
      let value = 'some fuzz foo';

      let node = new DSLExpression(value).ast.children[0].children[1];

      expect(DSLUpdateUtil.deleteNodeString(value, node))
        .toEqual('some foo');
    });

    it('should respect offset', function () {
      let value = 'some fuzz foo';
      let parseValue = 'foo';

      let node = new DSLExpression(parseValue).ast;

      expect(DSLUpdateUtil.deleteNodeString(value, node, 10))
        .toEqual('some fuzz');
    });

  });

  describe('#applyAdd', function () {

    it('should correctly add one attribute node to an expression', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value)
        .toEqual('foo bar label:text');
    });

    it('should correctly add fuzzy node to an expression', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value)
        .toEqual('foo bar text');
    });

    it('should correctly add exact node to an expression', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node]).value)
        .toEqual('foo bar "text"');
    });

    it('should correctly add two attribute nodes to an expression', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node, node]).value)
        .toEqual('foo bar label:text label:text');
    });

    it('should correctly add one attribute node to an expression with OR', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('foo bar, label:text');
    });

    it('should correctly add fuzzy node to an expression with OR', function () {
      let expression = new DSLExpression('"not fuzzy"');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: 'text'
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('"not fuzzy", text');
    });

    it('should correctly add exact node to an expression with OR', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: 'text'
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('foo bar, "text"');
    });

    it('should correctly create multi-value attribute when adding with OR', function () {
      let expression = new DSLExpression('foo bar label:some');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('foo bar label:some,text');
    });

    it('should correctly use custom nodeCompareFunction on newCombiner', function () {
      const customComparisionFunction = function (addingNode, astNode) {
        return astNode.filterParams.text === 'here';
      };

      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      let expression = new DSLExpression('label:not_here');
      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          nodeCompareFunction: customComparisionFunction,
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('label:not_here, label:text');

      expression = new DSLExpression('label:here');
      expect(
        DSLUpdateUtil.applyAdd(expression, [node], {
          nodeCompareFunction: customComparisionFunction,
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('label:here,text');
    });

  });

  describe('#applyReplace', function () {

    it('should correctly replace one node', function () {
      let expression = new DSLExpression('foo bar is:working');
      let attribNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {})
      );

      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'is', text: 'idle'
      });

      expect(DSLUpdateUtil.applyReplace(expression, attribNodes, [node]).value)
        .toEqual('foo bar is:idle');
    });

    it('should correctly replace more than one nodes', function () {
      let expression = new DSLExpression('some fuzzy nodes');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'here'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'can'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'be'})
      ];

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value)
        .toEqual('here can be');
    });

    it('should correctly delete excess nodes', function () {
      let expression = new DSLExpression('some fuzzy nodes that are gone');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'here'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'can'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'be'})
      ];

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value)
        .toEqual('here can be');
    });

    it('should correctly add missing nodes', function () {
      let expression = new DSLExpression('few');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'here'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'can'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'be'})
      ];

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace).value)
        .toEqual('here can be');
    });

    it('should correctly replace multi-value attribute nodes', function () {
      let expression = new DSLExpression('some fuzzy is:a,b,c nodes');
      let attribNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {label: 'is'})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'one'
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'of'
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'many'
        })
      ];

      expect(DSLUpdateUtil.applyReplace(expression, attribNodes, replace).value)
        .toEqual('some fuzzy is:one,of,many nodes');
    });

    it('should correctly add missing nodes using newCombiner=OR', function () {
      let expression = new DSLExpression('previous');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'here'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'can'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'be'})
      ];

      // NOTE: We already have a fuzzy node, so `newCombiner` shoud not be
      //       applied to the expression.
      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          newCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('here can be');
    });

    it('should correctly add missing nodes using itemCombiner=OR', function () {
      let expression = new DSLExpression('few');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {})
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'here'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'can'}),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'be'})
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('here, can, be');
    });

    it('should correctly continue with OR operator if itemCombiner=OR', function () {
      let expression = new DSLExpression('some label:foo');
      let fuzzyNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'label', text: 'foo'
        })
      );

      let replace = [
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'label', text: 'foo'
        }),
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'label', text: 'bar'
        })
      ];

      expect(
        DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace, {
          newCombiner: DSLCombinerTypes.OR,
          itemCombiner: DSLCombinerTypes.OR
        }).value
      ).toEqual('some label:foo,bar');
    });

  });

  describe('#applyDelete', function () {

    it('should correctly delete one attribute node', function () {
      let expression = new DSLExpression('is:attribute');
      let deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('');
    });

    it('should correctly delete first in multiple attribute nodes', function () {
      let expression = new DSLExpression('is:a is:b is:c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'a'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:b is:c');
    });

    it('should correctly delete last in multiple attribute nodes', function () {
      let expression = new DSLExpression('is:a is:b is:c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'c'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a is:b');
    });

    it('should correctly delete internal in multiple attribute nodes', function () {
      let expression = new DSLExpression('is:a is:b is:c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'b'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a is:c');
    });

    it('should correctly delete first in multi-value attribute nodes', function () {
      let expression = new DSLExpression('is:a,b,c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'a'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:b,c');
    });

    it('should correctly delete internal in multi-value attribute nodes', function () {
      let expression = new DSLExpression('is:a,b,c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'b'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a,c');
    });

    it('should correctly delete last in multi-value attribute nodes', function () {
      let expression = new DSLExpression('is:a,b,c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'c'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a,b');
    });

    it('should correctly delete one in multiple attribute nodes', function () {
      let expression = new DSLExpression('is:a is:b, is:c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'b'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a, is:c');
    });

    it('should correctly delete one in multi-value attribute node', function () {
      let expression = new DSLExpression('is:a,b,c');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'b'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a,c');
    });

    it('should correctly delete one fuzzy node', function () {
      let expression = new DSLExpression('fuzz');
      let deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('');
    });

    it('should correctly delete one exact node', function () {
      let expression = new DSLExpression('"exact"');
      let deleteNodes = [expression.ast];

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('');
    });

    it('should correctly delete nodes between other nodes', function () {
      let expression = new DSLExpression('some (fuzzy expression) "with" text');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {})
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('some (fuzzy expression) text');
    });

    it('should correctly delete lingering comma operators', function () {
      let expression = new DSLExpression('some, fuzz');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {text: 'fuzz'})
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('some');
    });

    it('should correctly delete is:c in "is:a,b,c is:d,c"', function () {
      let expression = new DSLExpression('is:a,b,c is:d,e');
      let deleteNodes = DSLUtil.findNodesByFilter(
        expression.ast,
        new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
          label: 'is', text: 'c'
        })
      );

      expect(DSLUpdateUtil.applyDelete(expression, deleteNodes).value)
        .toEqual('is:a,b is:d,e');
    });
  });

  describe('#defaultNodeCompareFunction', function () {

    it('should return false when comparing nodes of diferent type', function () {
      let nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: 'text'
      });
      let nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: 'text'
      });

      expect(DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB))
        .toBeFalsy();
    });

    it('should return true when both fuzzy regardless of text', function () {
      let nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: 'text1'
      });
      let nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.FUZZY, {
        text: 'text2'
      });

      expect(DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB))
        .toBeTruthy();
    });

    it('should return true when both exact regardless of text', function () {
      let nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: 'text1'
      });
      let nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: 'text2'
      });

      expect(DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB))
        .toBeTruthy();
    });

    it('should return false when both attrib but different label', function () {
      let nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: 'text1', label: 'label1'
      });
      let nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: 'text2', label: 'label2'
      });

      expect(DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB))
        .toBeFalsy();
    });

    it('should return false when both attrib and same label', function () {
      let nodeA = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: 'text1', label: 'label'
      });
      let nodeB = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.ATTRIB, {
        text: 'text2', label: 'label'
      });

      expect(DSLUpdateUtil.defaultNodeCompareFunction(nodeA, nodeB))
        .toBeTruthy();
    });

  });

});
