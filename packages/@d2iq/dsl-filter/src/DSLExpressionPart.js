import DSLFilterTypes from "./DSLFilterTypes";
import { FilterNode } from "./DSLASTNodes";

/**
 * The DSL Expression Parts are used by components inserted in a `DSLInputForm`
 * in order to specify the expression's AST nodes they are targeting.
 *
 * The functions and getters in this file are just shorthands to create virtual
 * AST nodes (without any position information) that are used as comparision
 * targets for selecting the correct nodes from the parsed AST nodes.
 *
 * @example <caption>How to use DSLExpressionPart</caption>
 *
 * const EXPRESSION_PARTS = {
 *
 *   // Create a boolean property that is defined when the attribute is:healthy
 *   // exists in the parsed DSL
 *   is_healthy: DSLExpressionPart.attribute('is', 'healthy'),
 *
 *   // Create a string property that contains the first exact-match node
 *   text: DSLExpressionPart.exact,
 *
 *   // Create a string property that contains all the fuzzy-match nodes,
 *   // concatenated with spaces
 *   text: DSLExpressionPart.fuzzy
 *
 * }
 *
 * class MyComponent {
 *   render() {
 *      const {expression} = this.props;
 *      const data = DSLUtil.getExpressionParts(expression, EXPRESSION_PARTS);
 *
 *      return (
 *         <div>
 *           <p>
 *             Is healthy: <input type="checkbox" checked={data.is_healthy} />
 *           </p>
 *         </div>
 *      );
 *   }
 * }
 *
 */
export default class DSLExpressionPart {
  static attribute(label, text = undefined) {
    return new FilterNode(0, 0, DSLFilterTypes.ATTRIB, { label, text });
  }

  static get exact() {
    return new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
  }

  static get fuzzy() {
    return new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
  }
}
