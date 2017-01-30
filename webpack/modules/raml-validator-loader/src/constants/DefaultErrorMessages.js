/**
 * Every time you are about to write a description for the error message
 * make sure that it sounds natural when prefixed with "The service"
 *
 * For example: "The service must be one of {{values}}"
 *
 * This can produce a more natural error description when used
 */
const DefaultErrorMessages = {
  'ENUM': 'Must be one of {{values}}',
  'ITEMS_MAX': 'Must contain at most {{value}} items in the array',
  'ITEMS_MIN': 'Must contain at least {{value}} items in the array',
  'ITEMS_UNIQUE': 'Must contain only unique items',
  'PROP_MISSING_MATCH': 'Must contain a property that matches `{{pattern}}`',
  'PROP_ADDITIONAL_PROPS': 'Contains extraneous property `{{name}}`',
  'PROP_IS_MISSING': 'Must be defined',
  'PROP_MISSING': 'Must define property `{{name}}`',
  'PROPS_MIN': 'Must contain at least {{value}} properties',
  'PROPS_MAX': 'Must contain at most {{value}} properties',
  'TYPE_NOT_NULL': 'Must be null',
  'TYPE_NOT_NUMBER': 'Must be a number',
  'TYPE_NOT_INTEGER': 'Must be an integer number',
  'TYPE_NOT_BOOLEAN': 'Must be a boolean value',
  'TYPE_NOT_STRING': 'Must be a string',
  'TYPE_NOT_DATETIME': 'Must be a date/time string',
  'TYPE_NOT_OBJECT': 'Must be an object',
  'TYPE_NOT_ARRAY': 'Must be an array',
  'NUMBER_MAX': 'Must be smaller than or equal to {{value}}',
  'NUMBER_MIN': 'Must be bigger than or equal to {{value}}',
  'NUMBER_TYPE': 'Must be of type `{{type}}`',
  'NUMBER_MULTIPLEOF': 'Must be multiple of {{value}}',
  'STRING_PATTERN': 'Must match the pattern `{{pattern}}`',
  'LENGTH_MIN': 'Must be at least {{value}} characters long',
  'LENGTH_MAX': 'Must be at most {{value}} characters long'
};

export default DefaultErrorMessages;
