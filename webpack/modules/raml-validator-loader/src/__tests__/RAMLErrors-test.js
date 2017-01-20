const ValidatorUtil = require('./utils/ValidatorUtil');

const createValidator = ValidatorUtil.createValidator;

describe('RAMLError', function () {

  describe('Enums', function () {

    it('should return ENUM error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    enum: [foo, bar]'
      ].join('\n'));
      const errors = validator('baz');

      expect(errors).toEqual([
        {
          path: [],
          type: 'ENUM',
          message: 'Must be one of foo, bar',
          variables: {
            'values': 'foo, bar'
          }
        }
      ]);
    });

  });

  describe('Arrays', function () {

    it('should return ITEMS_MAX error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number[]',
        '    maxItems: 1'
      ].join('\n'));
      const errors = validator([1, 2]);

      expect(errors).toEqual([
        {
          path: [],
          type: 'ITEMS_MAX',
          message: 'Must contain at most 1 items in the array',
          variables: {
            'value': 1
          }
        }
      ]);
    });

    it('should return ITEMS_MIN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number[]',
        '    minItems: 1'
      ].join('\n'));
      const errors = validator([]);

      expect(errors).toEqual([
        {
          path: [],
          type: 'ITEMS_MIN',
          message: 'Must contain at least 1 items in the array',
          variables: {
            'value': 1
          }
        }
      ]);
    });

    it('should return ITEMS_UNIQUE error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number[]',
        '    uniqueItems: true'
      ].join('\n'));
      const errors = validator([1, 2, 1]);

      expect(errors).toEqual([
        {
          path: [],
          type: 'ITEMS_UNIQUE',
          message: 'Must contain only unique items',
          variables: {}
        }
      ]);
    });

  });

  describe('Objects', function () {

    it('should return PROP_MISSING_MATCH error when expected', function () {
      const config = {patternPropertiesAreOptional: false};
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    properties:',
        '      /^foo/: string'
      ].join('\n'), config);
      const errors = validator({bar: 'baz'});

      expect(errors).toEqual([
        {
          path: [],
          type: 'PROP_MISSING_MATCH',
          message: 'Must contain a property that matches `^foo`',
          variables: {
            'pattern': '^foo'
          }
        }
      ]);
    });

    it('should return PROP_ADDITIONAL_PROPS error when expected', function () {
      const config = {patternPropertiesAreOptional: false};
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    additionalProperties: false',
        '    properties:',
        '      a: string'
      ].join('\n'), config);
      const errors = validator({a: 'foo', b: 'bar'});

      expect(errors).toEqual([
        {
          path: [],
          type: 'PROP_ADDITIONAL_PROPS',
          message: 'Contains extraneous property `b`',
          variables: {
            name: 'b'
          }
        }
      ]);
    });

    it('should return PROP_IS_MISSING error when expected', function () {
      const config = {missingPropertiesOnTheirPath: true};
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    properties:',
        '      a: string'
      ].join('\n'), config);
      const errors = validator({});

      expect(errors).toEqual([
        {
          path: ['a'],
          type: 'PROP_IS_MISSING',
          message: 'Must be defined',
          variables: {
            name: 'a'
          }
        }
      ]);
    });

    it('should return PROP_MISSING error when expected', function () {
      const config = {missingPropertiesOnTheirPath: false};
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    properties:',
        '      a: string'
      ].join('\n'), config);
      const errors = validator({});

      expect(errors).toEqual([
        {
          path: [],
          type: 'PROP_MISSING',
          message: 'Must define property `a`',
          variables: {
            name: 'a'
          }
        }
      ]);
    });

    it('should return PROPS_MIN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: object',
        '    minProperties: 1'
      ].join('\n'));
      const errors = validator({});

      expect(errors).toEqual([
        {
          path: [],
          type: 'PROPS_MIN',
          message: 'Must contain at least 1 properties',
          variables: {
            value: 1
          }
        }
      ]);
    });

    it('should return PROPS_MAX error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: object',
        '    maxProperties: 1'
      ].join('\n'));
      const errors = validator({a: 'foo', b: 'bar'});

      expect(errors).toEqual([
        {
          path: [],
          type: 'PROPS_MAX',
          message: 'Must contain at most 1 properties',
          variables: {
            value: 1
          }
        }
      ]);
    });

  });

  describe('Native Types', function () {

    it('should return TYPE_NOT_NULL error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: nil'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_NULL',
          message: 'Must be null',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_NUMBER error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_NUMBER',
          message: 'Must be a number',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_INTEGER error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: integer'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_INTEGER',
          message: 'Must be an integer number',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_BOOLEAN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: boolean'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_BOOLEAN',
          message: 'Must be a boolean value',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_STRING error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: string'
      ].join('\n'));
      const errors = validator({});

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_STRING',
          message: 'Must be a string',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_DATETIME error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: datetime'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_DATETIME',
          message: 'Must be a date/time string',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_OBJECT error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: object'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_OBJECT',
          message: 'Must be an object',
          variables: {
          }
        }
      ]);
    });

    it('should return TYPE_NOT_ARRAY error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: array'
      ].join('\n'));
      const errors = validator('foo');

      expect(errors).toEqual([
        {
          path: [],
          type: 'TYPE_NOT_ARRAY',
          message: 'Must be an array',
          variables: {
          }
        }
      ]);
    });

  });

  describe('Numbers', function () {

    it('should return NUMBER_MAX error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number',
        '    maximum: 2'
      ].join('\n'));
      const errors = validator(3);

      expect(errors).toEqual([
        {
          path: [],
          type: 'NUMBER_MAX',
          message: 'Must be smaller than or equal to 2',
          variables: {
            value: 2
          }
        }
      ]);
    });

    it('should return NUMBER_MIN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number',
        '    minimum: 2'
      ].join('\n'));
      const errors = validator(1);

      expect(errors).toEqual([
        {
          path: [],
          type: 'NUMBER_MIN',
          message: 'Must be bigger than or equal to 2',
          variables: {
            value: 2
          }
        }
      ]);
    });

    it('should return NUMBER_TYPE error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number',
        '    format: int8'
      ].join('\n'));
      const errors = validator(1024);

      expect(errors).toEqual([
        {
          path: [],
          type: 'NUMBER_TYPE',
          message: 'Must be of type `int8`',
          variables: {
            type: 'int8'
          }
        }
      ]);
    });

    it('should return NUMBER_MULTIPLEOF error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: number',
        '    multipleOf: 4'
      ].join('\n'));
      const errors = validator(3);

      expect(errors).toEqual([
        {
          path: [],
          type: 'NUMBER_MULTIPLEOF',
          message: 'Must be multiple of 4',
          variables: {
            value: 4
          }
        }
      ]);
    });

  });

  describe('Strings', function () {

    it('should return STRING_PATTERN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: string',
        '    pattern: ^foo'
      ].join('\n'));
      const errors = validator('bar');

      expect(errors).toEqual([
        {
          path: [],
          type: 'STRING_PATTERN',
          message: 'Must match the pattern `^foo`',
          variables: {
            pattern: '^foo'
          }
        }
      ]);
    });

    it('should return LENGTH_MIN error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: string',
        '    minLength: 2'
      ].join('\n'));
      const errors = validator('a');

      expect(errors).toEqual([
        {
          path: [],
          type: 'LENGTH_MIN',
          message: 'Must be at least 2 characters long',
          variables: {
            value: 2
          }
        }
      ]);
    });

    it('should return LENGTH_MAX error when expected', function () {
      const validator = createValidator([
        '#%RAML 1.0',
        'types:',
        '  TestType:',
        '    type: string',
        '    maxLength: 2'
      ].join('\n'));
      const errors = validator('abc');

      expect(errors).toEqual([
        {
          path: [],
          type: 'LENGTH_MAX',
          message: 'Must be at most 2 characters long',
          variables: {
            value: 2
          }
        }
      ]);
    });

  });

});
