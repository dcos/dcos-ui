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

      expect(DSLUpdateUtil.applyAdd(expression, [node], DSLCombinerTypes.OR).value)
        .toEqual('foo bar, label:text');
    });

    it('should correctly add fuzzy node to an expression with OR', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node], DSLCombinerTypes.OR).value)
        .toEqual('foo bar, text');
    });

    it('should correctly add exact node to an expression with OR', function () {
      let expression = new DSLExpression('foo bar');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node], DSLCombinerTypes.OR).value)
        .toEqual('foo bar, "text"');
    });

    it('should correctly create multi-value attribute when adding with OR', function () {
      let expression = new DSLExpression('foo bar label:some');
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(DSLUpdateUtil.applyAdd(expression, [node], undefined,
        DSLCombinerTypes.OR).value)
        .toEqual('foo bar label:some,text');
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

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace,
        DSLCombinerTypes.OR).value).toEqual('here, can be');
    });

    it('should correctly add missing nodes using both OR combiners', function () {
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

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace,
        DSLCombinerTypes.OR, DSLCombinerTypes.OR).value)
        .toEqual('here, can, be');
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

      expect(DSLUpdateUtil.applyReplace(expression, fuzzyNodes, replace,
        DSLCombinerTypes.OR, DSLCombinerTypes.OR).value)
        .toEqual('some label:foo,bar');
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

  describe('#getFilterForNode', function () {

    it('should correctly return a node without position info', function () {
      let node = new DSLASTNodes.FilterNode(1, 4, DSLFilterTypes.EXACT, {
        text: 'text'
      });

      expect(DSLUpdateUtil.getFilterForNode(node).position).toEqual([[0, 0]]);
    });

    it('should correctly return a node wihout label text', function () {
      let node = new DSLASTNodes.FilterNode(4, 9, DSLFilterTypes.ATTRIB, {
        text: 'text', label: 'foo'
      });

      expect(DSLUpdateUtil.getFilterForNode(node).filterParams)
        .toEqual({label: 'foo'});
    });

  });

});
