export interface DSLASTNodes {}
export interface DSLFilter {}
export const DSLFilterTypes = {
  ATTRIB: 1,
  EXACT: 2,
  FUZZY: 3
};
export const DSLCombinerTypes = {
  AND: 1,
  OR: 2
};
export const DSLExpression = {};
export const DSLExpressionPart = {
  attribute(label: string, text: string?) {}
};
export const DSLFormUtil = {};
export const DSLParserUtil = {};
export const DSLUpdatePolicy = {};
export const DSLUpdateUtil = {};
export const DSLUtil = {
  canProcessParts(expression: DSLExpression, partFilters: []) {},
  getPartValues(expression: DSLExpression, partFilters: []) {}
};

