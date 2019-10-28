/**
 * Base class for AST nodes in DSL, representing a token in the user input
 */
export class ASTNode {
  /**
   * @param {number} start - The starting point of the token in the input string
   * @param {number} end - The ending point of the token in the input string
   * @param {ASTNode[]} children - Child nodes to this node
   */
  constructor(start, end, children = []) {
    /**
     * The position array contains an array of tuples, containing the start-end
     * position of each relevant text portions that composes this token.
     *
     * In 99.9% of the cases, this is an array with only 1 tuple. However, when
     * the `attribute:value1,value2` shorthand is used, this array will contain
     * 2 tuples, pointing to the `attribute:` and `valueX` parts separately.
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
export class CombinerNode extends ASTNode {
  /**
   * @param {DSLCombinerTypes} combinerType - The combiner type (AND, OR)
   * @param {ASTNode} child1 - The left-side operator
   * @param {ASTNode} child2 - The right-side operator
   */
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
export class FilterNode extends ASTNode {
  /**
   * @param {number} start - The starting point of the token in the input string
   * @param {number} end - The ending point of the token in the input string
   * @param {DSLFilterTypes} filterType - The filter type (ATTRIB, EXACT, FUZZY)
   * @param {Object} filterParams - Arbitrary parameters to the filter (ex. text)
   */
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
