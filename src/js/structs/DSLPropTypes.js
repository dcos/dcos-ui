import DSLFilterTypes from '../constants/DSLFilterTypes';
import {FilterNode} from './DSLASTNodes';

/**
 * The DSL PropTypes are used by components inserted in a `DSLInputForm` in
 * order to specify the AST nodes they are managing.
 *
 * The functions and getters in this file are just shorthands to create virtual
 * AST nodes (without any position information) that are used as comparision
 * targets for selecting the correct nodes from the paresed AST nodes.
 *
 * @example <caption>How to use DSLPropTypes</caption>
 *
 * MyFormComponent.dslPropTypes = {
 *
 *   // Create a boolean property that is defined when the attribute is:healthy
 *   // exists in the parsed DSL
 *   is_healthy: DSLPropTypes.attrib('is', 'healthy'),
 *
 *   // Create a string property that contains the first exact-match node
 *   text: DSLPropTypes.exact,
 *
 *   // Create a string property that contains all the fuzzy-match nodes,
 *   // concatenated with spaces
 *   text: DSLPropTypes.fuzzy
 *
 * }
 */
class DSLPropTypes {

  static attrib(label, text=undefined) {
    return new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {label, text});
  }

  static get exact() {
    return new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
  }

  static get fuzzy() {
    return new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
  }

};

module.exports = DSLPropTypes;
