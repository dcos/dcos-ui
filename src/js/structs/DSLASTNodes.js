/**
 * Base class for AST nodes in DSL, representing a token in the user input
 */
class ASTNode {
  constructor(start, end, children=[]) {

    /**
     * The position array contains an array of tuples, containing the start-end
     * position of each relevant text portions that composes this token.
     *
     * In 99.9% of the cases, this is an array with only 1 tuple. However, when
     * the `attrib:value1,value2` shorthand is used, this array will contain
     * 2 tuples, pointing to the `attrib:` and `valueX` parts separately.
     *
     * @var {Array}
     */
    this.position = [[start, end]];

    /**
     * Child tokens in this token tree
     *
     * @var {Array}
     */
    this.children = children;

  }
}

/**
 * Combiner (operator) AST node
 */
class CombinerNode extends ASTNode {
  constructor(combinerType, child1, child2) {
    super(
      child1.position[0][0],
      child2.position[child2.position.length - 1][1],
      [child1, child2]
    );

    /**
     * The type of the combiner
     * @var {Number}
     */
    this.combinerType = combinerType;
  }
}

/**
 * Filter (operand) AST node
 */
class FilterNode extends ASTNode {
  constructor(start, end, filterType, filterParams) {
    super(start, end);
    /**
     * The type of the filter
     * @var {Number}
     */
    this.filterType = filterType;

    /**
     * The parameters to the filter
     * @var {{text, [label]}}
     */
    this.filterParams = filterParams;
  }
}

/**
 * Expose the leaf nodes that can be used in more than one place
 */
module.exports = {
  CombinerNode,
  FilterNode
};
