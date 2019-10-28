import DSLFilterTypes from "./DSLFilterTypes";

/**
 * This function creates a `nodeCompareFunction` function, used by the
 * expression update utilities to detect relevant nodes.
 *
 * This is used internally by DSLUpdateUtil in order to update existing nodes
 * or detect if the node being added is the first one and therefore needs
 * to have a different combine operator.
 *
 * @param {Object} parts - An object with the part configuration
 * @returns {function} Returns a compatible function for use by applyadd
 */
// eslint-disable-next-line import/prefer-default-export
export function createNodeComparisionFunction(parts) {
  const referenceNodes = Object.keys(parts).map(key => parts[key]);

  /**
   * The returned function is called when the node `nodeAdded` is about to
   * be added on the AST. The `astNode` is the current node being walked over.
   *
   * Returning `true` means that the AST already contains a relevant node and
   * that node must be updated (if possible).
   *
   * The default behavior is to loosely compare AST nodes, meaning that
   * attribute nodes will be compared only against their `label`. However this
   * function makes attribute matching more strict, and scoped to the parts
   * given.
   *
   * This makes it possible to have attributes that share the same `label` yet
   * still be considered separate nodes. For example, when the OR operator is
   * applied between matching labels they will be processed as `is:a, is:b`
   * instead of `is:a,b`.
   *
   * @param {FilterNode} nodeAdded - The node being added to the expression
   * @param {FilterNode} astNode - The node in the AST to compare against
   * @returns {Boolean} Return true if the two nodes are compatible
   */
  return function(nodeAdded, astNode) {
    return referenceNodes.some(referenceNode => {
      if (referenceNode.filterType !== astNode.filterType) {
        return false;
      }

      // Free-text nodes are not strict
      if (referenceNode.filterType !== DSLFilterTypes.ATTRIB) {
        return true;
      }

      // But attribute nodes are strict
      return (
        referenceNode.filterParams.label === astNode.filterParams.label &&
        referenceNode.filterParams.text === astNode.filterParams.text
      );
    });
  };
}
