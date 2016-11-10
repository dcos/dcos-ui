module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _fs = __webpack_require__(1);

	var _fs2 = _interopRequireDefault(_fs);

	var _path = __webpack_require__(2);

	var _path2 = _interopRequireDefault(_path);

	var _raml1Parser = __webpack_require__(3);

	var _raml1Parser2 = _interopRequireDefault(_raml1Parser);

	var _Generator = __webpack_require__(4);

	var _Generator2 = _interopRequireDefault(_Generator);

	var _GeneratorContext = __webpack_require__(14);

	var _GeneratorContext2 = _interopRequireDefault(_GeneratorContext);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Entry point of the raml-validator-loader
	 */
	module.exports = function (source) {

	  // Mark the contents cacheable
	  this.cacheable();

	  // Override the default filesystem resolver in order to:
	  //
	  // 1) Provide a custom content for the source file
	  // 2) Track dependant files in order for webpack to invalidate caches
	  //
	  var raml = _raml1Parser2.default.loadApiSync(this.resourcePath, {
	    fsResolver: {
	      content: function (path) {
	        if (path == this.resourcePath) {
	          return source;
	        }

	        this.addDependency(path);
	        return _fs2.default.readFileSync(path).toString();
	      }.bind(this)
	    }
	  });

	  // Prepare generator context
	  var ctx = new _GeneratorContext2.default();

	  // Use all types in this RAML specification
	  raml.types().forEach(function (type) {
	    ctx.uses(type.runtimeType());
	  });

	  // Generate source
	  return _Generator2.default.generate(ctx);
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("raml-1-parser");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _RAMLUtil = __webpack_require__(5);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	var _GeneratorUtil = __webpack_require__(7);

	var _GeneratorUtil2 = _interopRequireDefault(_GeneratorUtil);

	var _TypeValidator = __webpack_require__(8);

	var _TypeValidator2 = _interopRequireDefault(_TypeValidator);

	var _RAMLError = __webpack_require__(13);

	var _RAMLError2 = _interopRequireDefault(_RAMLError);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {

	  /**
	   * Generate a comment
	   */
	  commentBlock: function commentBlock(desc) {
	    return [].concat(['/**'], desc.split('\n').map(function (line) {
	      return ' * ' + line;
	    }), [' */']);
	  },

	  /**
	   * Generate a full source using the given generator context
	   */
	  generate: function generate(ctx) {

	    // First build the validator fragments
	    var itype = void 0;
	    var validatorFragments = ['var Validators = {'];
	    while (itype = ctx.nextTypeInQueue()) {
	      var typeName = _RAMLUtil2.default.getTypeName(itype);

	      if (typeName === 'any') {
	        validatorFragments = validatorFragments.concat('\t' + typeName + ': function(value, _path) { return [] },');
	        continue;
	      }

	      var comment = itype.examples()[0].expandAsString();
	      if (_RAMLUtil2.default.isInlineType(itype)) {
	        comment += '\n\n' + _RAMLUtil2.default.getInlineTypeComment(itype);
	      }

	      validatorFragments = validatorFragments.concat(_GeneratorUtil2.default.indentFragments(this.commentBlock(comment)), ['\t' + typeName + ': function(value, _path) {', '\t\tvar path = _path || [];', '\t\tvar errors = [];'], _GeneratorUtil2.default.indentFragments(_TypeValidator2.default.generateTypeValidator(itype, ctx), '\t\t'), ['\t\treturn errors;', '\t},', '']);
	    }
	    validatorFragments.push('};');
	    validatorFragments.push('return Validators;');

	    // THEN build the constants table fragments
	    var globalTableFragments = Object.keys(ctx.constantTables).reduce(function (lines, tableName) {
	      var table = ctx.constantTables[tableName];
	      if (Array.isArray(table)) {
	        return lines.concat(['var ' + tableName + ' = ['], _GeneratorUtil2.default.indentFragments(table).map(function (line) {
	          return line + ',';
	        }), ['];']);
	      } else {
	        return lines.concat(['var ' + tableName + ' = {'], _GeneratorUtil2.default.indentFragments(Object.keys(table).map(function (key) {
	          return key + ': ' + table[key] + ',';
	        })), ['};', '']);
	      }
	    }, []);

	    // Compose result
	    return [].concat('module.exports = (function() {', [_RAMLError2.default], globalTableFragments, '', validatorFragments, '', '})();').join('\n');
	  }

	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _crypto = __webpack_require__(6);

	var _crypto2 = _interopRequireDefault(_crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {

	  /**
	   * This function checks if the given runtime type is an inline defininition,
	   * since such definitions needs further specialisation.
	   *
	   * Keep in mind that the RAML parser considers this:
	   *
	   * properties:
	   *   arrayProp:
	   *     type: array
	   *
	   * To be different than this:
	   *
	   * properties:
	   *   arrayProp:
	   *     type: array
	   *     minimum: 0
	   *
	   * Since the latter is defining an 'anonymous' type in-place
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type to check
	   * @returns {Boolean} Returns true if this type is an in-line definition
	   */
	  isInlineType: function isInlineType(itype) {
	    // So, a type that has no name, but is either an array or a value type
	    // is considered an in-line definition, and has a dedicated specialisation
	    return itype.nameId() == null && (itype.isArray() || itype.isValueType());
	  },


	  /**
	   * Return a comment that describes this inline type
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type
	   * @returns {String} The comment to the specialised inline type
	   */
	  getInlineTypeComment: function getInlineTypeComment(itype) {
	    var facets = itype.getFixedFacets();
	    var comment = 'This is an in-line specialisation of ' + this.getInlineTypeBase(itype) + '\n with the following constraints:\n\n';
	    return comment + Object.keys(facets).map(function (name) {
	      if (name === 'items') {
	        return '- ' + name + ': ' + this.getTypeName(facets[name].extras.nominal);
	      } else {
	        return '- ' + name + ': ' + facets[name];
	      }
	    }, this).join('\n');
	  },


	  /**
	   * Walk up the type and find out the built-in type
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type
	   * @returns {ITypeDefinition|null} The builtin type or null if not found
	   */
	  getBuiltinTypeName: function getBuiltinTypeName(itype) {
	    if (itype.isBuiltIn()) {
	      return itype.nameId();
	    }

	    return itype.allSuperTypes().find(function (type) {
	      return type.isBuiltIn().nameId();
	    });

	    return null;
	  },


	  /**
	   * Returns the base type of the given in-line type definition
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type
	   * @returns {String} The string name of the base type
	   */
	  getInlineTypeBase: function getInlineTypeBase(itype) {
	    var typeName = itype.nameId();
	    if (typeName == null) {
	      if (itype.isArray()) {
	        typeName = this.getTypeName(itype.componentType());
	      } else if (itype.isValueType()) {
	        typeName = this.getTypeName(itype.superTypes()[0]);
	      } else {
	        typeName = 'any';
	      }
	    }

	    return typeName;
	  },


	  /**
	   * Returns a unique name for this inline type, by calculating a checksum
	   * of the values of it's facets.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type
	   * @returns {String} A unique name for this type, based on it's facets values
	   */
	  getInlineTypeName: function getInlineTypeName(itype) {
	    // Calculate the checksum of the facets
	    var facets = itype.getFixedFacets();
	    var facetKeys = Object.keys(facets).sort();
	    var expr = facetKeys.reduce(function (expr, key) {
	      return expr + '|' + key + '=' + facets[key];
	    }, '');

	    // Calculate unique name
	    var typeName = this.getInlineTypeBase(itype);
	    return 'inline' + typeName[0].toUpperCase() + typeName.substr(1) + '_' + _crypto2.default.createHash('md5').update(expr).digest('hex');
	  },


	  /**
	   * This function tries to put a name on the given run-time RAML type.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML type
	   * @returns {String} Returns a string with the name of the given type
	   */
	  getTypeName: function getTypeName(itype) {

	    // Inline types are processed first
	    if (this.isInlineType(itype)) {
	      return this.getInlineTypeName(itype);
	    }

	    // The moment we have found a named type we are good
	    if (itype.nameId() != null) {

	      // There are cases with anonymous arrays
	      if (!itype.nameId() && itype.isArray()) {
	        return this.getTypeName(itype.componentType()) + 'AsArray';
	      }

	      return itype.nameId();
	    }

	    // If this is a value type, walk the tree upwards
	    if (itype.isValueType()) {
	      return this.getTypeName(itype.superTypes()[0]);
	    }

	    // A special case, where we have a structured item, but without an id
	    // or properties, that's an empty field definition. For example:
	    //
	    // labels?:
	    //   type: labels.KVLabels
	    //   description: some text
	    //
	    if (itype.hasStructure() && itype.superTypes().length) {
	      return this.getTypeName(itype.superTypes()[0]);
	    }

	    // This looks like an anonymous inline array type
	    if (itype.isArray()) {
	      return this.getTypeName(itype.componentType()) + 'AsArray';
	    }

	    // That looks like an unnamed type :/
	    throw new Error('Don\'t know how to handle anonymous, structured types');
	  },


	  /**
	   * This function walks up the type tree until it reaches a native type
	   * and then returns it's type.
	   */
	  getBuiltinType: function getBuiltinType(itype) {
	    if (itype.isBuiltIn()) {
	      return itype;
	    }

	    return itype.allSuperTypes().find(function (type) {
	      return type.isBuiltIn();
	    });
	  }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {

	  /**
	   * Indent the given fragments
	   */
	  indentFragments: function indentFragments(fragments) {
	    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\t';

	    return fragments.map(function (line) {
	      return '' + prefix + line;
	    });
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _FacetValidators = __webpack_require__(9);

	var _FacetValidators2 = _interopRequireDefault(_FacetValidators);

	var _GeneratorUtil = __webpack_require__(7);

	var _GeneratorUtil2 = _interopRequireDefault(_GeneratorUtil);

	var _HighOrderComposers = __webpack_require__(11);

	var _HighOrderComposers2 = _interopRequireDefault(_HighOrderComposers);

	var _NativeValidators = __webpack_require__(12);

	var _NativeValidators2 = _interopRequireDefault(_NativeValidators);

	var _RAMLUtil = __webpack_require__(5);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {

	  /**
	   * Generate a validator function for the given internal RAML type
	   *
	   * @param {ITypeDefinition} itype - The run-time RAML type to generate a validator for
	   * @param {GeneratorContext} context - The generator context
	   *
	   * @returns {String} - Returns the function javascript source
	   */
	  generateTypeValidator: function generateTypeValidator(itype, context) {
	    var typeName = _RAMLUtil2.default.getTypeName(itype);
	    var fragments = [];

	    // We first use the high-order composers to generate the base code
	    // depending on the major classifications of the validators
	    if (itype.isUnion()) {
	      var leftTypeValidatorFn = context.uses(itype.leftType());
	      var rightTypeValidatorFn = context.uses(itype.rightType());
	      fragments = _HighOrderComposers2.default.composeUnion(itype.getFixedFacets(), leftTypeValidatorFn, rightTypeValidatorFn, context);
	    } else {
	      fragments = _HighOrderComposers2.default.composeFacets(itype.getFixedFacets(), context);
	    }

	    // If we have an object, iterate over it's properties and create
	    // validation constraints
	    if (itype.isObject()) {
	      fragments = fragments.concat(_HighOrderComposers2.default.composeObjectProperties(itype.allProperties(), itype.facets(), context));
	    }

	    // Wrap everything in type validation
	    var type = _RAMLUtil2.default.getBuiltinType(itype);
	    return _NativeValidators2.default.wrapWithNativeTypeValidator(fragments, type, context);
	  }
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _FragmentFactory = __webpack_require__(10);

	var _FragmentFactory2 = _interopRequireDefault(_FragmentFactory);

	var _RAMLUtil = __webpack_require__(5);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var FACET_FRAGMENT_GENERATORS = {

	  /**
	   * [Number]  `maximum`: Maximum numeric value
	   */
	  maximum: function maximum(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'NUMBER_MAX', 'Must be smaller than {value}');

	    return _FragmentFactory2.default.testAndPushError('value > ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Number] `minimum`: Minimum numeric value
	   */
	  minimum: function minimum(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'NUMBER_MIN', 'Must be bigger than {value}');

	    return _FragmentFactory2.default.testAndPushError('value < ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Number] `format` : The format of the value
	   *
	   * Must be one of: int32, int64, int, long, float, double, int16, int8
	   */
	  format: function format(value, context) {
	    var IS_FLOAT = '(value % 1 !== 0)';
	    var IS_INT = '(value % 1 === 0)';
	    var FLOAT_HELPER = context.getConstantExpression('HELPERS', 'new Float32Array(1)');

	    var condition = void 0;
	    switch (value) {
	      case 'int64':
	        condition = '' + IS_INT;
	        break;

	      case 'int32':
	        condition = IS_INT + ' && (value >= -2147483648) && (value <= 2147483647)';
	        break;

	      case 'int16':
	        condition = IS_INT + ' && (value >= -32768) && (value <= 32767)';
	        break;

	      case 'int8':
	        condition = IS_INT + ' && (value >= -128) && (value <= 127)';
	        break;

	      case 'int':
	        condition = IS_INT + ' && (value >= -32768) && (value <= 32767)';
	        break;

	      case 'long':
	        condition = IS_INT + ' && (value >= -2147483648) && (value <= 2147483647)';
	        break;

	      case 'float':
	        //
	        // To test for Float32 we are first casting the number to an internally
	        // representable Float32 number and we are then calculating the difference
	        // to the original value.
	        //
	        // We are then checking if this difference is smaller than the number of
	        // decimals in the number
	        //
	        condition = 'Math.abs((' + FLOAT_HELPER + '[0] = value) - ' + FLOAT_HELPER + '[0])' + ' < Math.pow(10, -(value+\'.\').split(\'.\')[1].length-1)';
	        break;

	      case 'double':
	        return [];
	        break;

	      default:
	        throw new TypeError('Unknown value for the \'format\' facet: \'' + value + '\'');
	    }

	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'NUMBER_TYPE', 'Must be of type `{value}`');

	    return _FragmentFactory2.default.testAndPushError('!(' + condition + ')', ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Number] `multipleOf` : Value must be divisable by this value
	   */
	  multipleOf: function multipleOf(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'NUMBER_MULTIPLEOF', 'Must be multiple of {value}');

	    return _FragmentFactory2.default.testAndPushError('value % ' + value + ' !== 0', ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [String] `pattern`: Regular expression this value should match against
	   */
	  pattern: function pattern(value, context) {
	    var REGEX = context.getConstantExpression('REGEX', '/' + value + '/');
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'STRING_PATTERN', 'Must match the pattern "{pattern}"');

	    return _FragmentFactory2.default.testAndPushError('!' + REGEX + '.exec(value)', ERROR_MESSAGE, { pattern: value });
	  },

	  /**
	   * [String] `minLength`: Minimum length of the string
	   */
	  minLength: function minLength(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'LENGTH_MIN', 'Must be at least {value} characters long');

	    return _FragmentFactory2.default.testAndPushError('value.length < ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [String] `maxLength`: Maximum length of the string
	   */
	  maxLength: function maxLength(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'LENGTH_MAX', 'Must be at most {value} characters long');

	    return _FragmentFactory2.default.testAndPushError('value.length > ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Array] `minItems` : Minimum amount of items in the array
	   */
	  minItems: function minItems(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'ITEMS_MIN', 'Must contain at least {value} items in the array');

	    return _FragmentFactory2.default.testAndPushError('value.length < ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Array] `maxItems` : Maximum amount of items in the array
	   */
	  maxItems: function maxItems(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'ITEMS_MAX', 'Must contain at most {value} items in the array');

	    return _FragmentFactory2.default.testAndPushError('value.length > ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Array] `uniqueItems` : All array items MUST be unique
	   */
	  uniqueItems: function uniqueItems(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'ITEMS_UNIQUE', 'Must contain only unique items');

	    return ['if ((function() {', '\tvar valuesSoFar = Object.create(null);', '\tfor (var i = 0; i < value.length; ++i) {', '\t\tvar val = value[i];', '\t\tif (val in valuesSoFar) {', '\t\t\treturn true;', '\t\t}', '\t\tvaluesSoFar[val] = true;', '\t}', '\treturn false;', '})()) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '}'];
	  },

	  /**
	   * [Array] `items` : Type for the items
	   */
	  items: function items(value, context) {

	    // The value passed is an `InheritedType` instance, that describes the
	    // RAML metadata. In order to access the underlying run-time information,
	    // that we operate upon, we need to use `extras.normal` to access it:
	    var itype = value.extras.nominal;
	    var validatorFn = context.uses(itype);

	    // Validate every child
	    return ['errors = value.reduce(function(errors, value, i) {', '\treturn errors.concat(', '\t\t' + validatorFn + '(value, path.concat([i]))', '\t);', '}, errors);'];
	  },

	  //
	  // Object facets from here:
	  // https://github.com/raml-org/raml-spec/blob/master/versions/raml-10/raml-10.md#object-type
	  //

	  /**
	   * [Object] `minProperties`: Minimum number of properties
	   */
	  minProperties: function minProperties(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'PROPS_MIN', 'Must contain at least {value} properties in the object');

	    return _FragmentFactory2.default.testAndPushError('Object.keys(value).length < ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [Object] `maxProperties`: Maximum number of properties
	   */
	  maxProperties: function maxProperties(value, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'PROPS_MAX', 'Must contain at most {value} properties in the object');

	    return _FragmentFactory2.default.testAndPushError('Object.keys(value).length > ' + value, ERROR_MESSAGE, { value: value });
	  },

	  /**
	   * [General] `enum`: Enumeration of the given values
	   */
	  enum: function _enum(values, context) {
	    var ENUM = context.getConstantExpression('ENUMS', JSON.stringify(values));
	    var ENUM_STRING = values.map(function (value) {
	      return String(value);
	    }).join(', ');
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'ENUM', 'Must be one of {values}');

	    return _FragmentFactory2.default.testAndPushError(ENUM + '.indexOf(value) === -1', ERROR_MESSAGE, { values: ENUM_STRING });
	  },

	  /**
	   * (Handled by the HighOrderComposers, since it's not so simple to be
	   * implemented as a fragment generator)
	   */
	  additionalProperties: function additionalProperties() {
	    return [];
	  }

	};

	module.exports = {

	  /**
	   * Generate an array of code fragments that perform the validataions as
	   * described in the `facets` object.
	   *
	   * @param {Object} facets - The object with the facet names and values
	   * @param {GeneratorContext} context - The generator context
	   *
	   * @returns {Array} Returns an array of validator code fragments
	   */
	  generateFacetFragments: function generateFacetFragments(facets, context) {
	    var keys = Object.keys(facets);
	    return keys.reduce(function (fragments, facet) {
	      if (FACET_FRAGMENT_GENERATORS[facet] == null) {
	        throw new TypeError('Unknown facet: \'' + facet + '\'');
	      }

	      return fragments.concat(FACET_FRAGMENT_GENERATORS[facet](facets[facet], context));
	    }, []);
	  }
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {

	  /**
	   * Simple fragment factory that tests the given expression and if it fails,
	   * it creates a new RAMLError instance with the error message from the
	   * constant specified. If that constant is using templates, you can use the
	   * errorMessageVariables to pass values for these variables.
	   *
	   * @param {String} testExpr - The javascript test expression
	   * @param {String} errorConstant - The error constant from the ERROR_MESSAGES global table
	   * @param {Object} [errorMessageVariables] - Optional values for the error message templates
	   *
	   * @returns {String} Returns the contents of the javascript fragment
	   */
	  testAndPushError: function testAndPushError(testExpr, errorConstant) {
	    var errorMessageVariables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	    var variablesExpr = JSON.stringify(errorMessageVariables);

	    return ['if (' + testExpr + ') {', '\terrors.push(new RAMLError(path, ' + errorConstant + ', ' + variablesExpr + '));', '}'];
	  },


	  /**
	   * Delegate the property validation to the given delegate function.
	   * Such functions can be any other validation function generated so far or
	   * will be generated in the future.
	   *
	   * @param {String} property - The property whose check you want to delegate
	   * @param {}
	   */
	  delegatePropertyValidation: function delegatePropertyValidation(property, delegateFn) {
	    return ['errors = errors.concat(RAMLValidators.' + delegateFn + '(value.' + property + ', path.concat[\'' + property + '\']));'];
	  },


	  /**
	   * Run the given expression only if the given property is not missing
	   */
	  runIfPropNotMissing: function runIfPropNotMissing(property, expression) {
	    var indentedExpression = '\t' + expression.replace(/\n/g, '\n\t');

	    return ['if (value.' + property + ' != null) {', indentedExpression, '}'];
	  }
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _templateObject = _taggedTemplateLiteral(['});'], ['});']);

	var _FacetValidators = __webpack_require__(9);

	var _FacetValidators2 = _interopRequireDefault(_FacetValidators);

	var _GeneratorUtil = __webpack_require__(7);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

	var REGEX_MATCHING_REGEX = /[\[\]\(\)\{\}\\\^\$\.\|\?\*\+/]/g;

	var HighOrderComposers = {

	  /**
	   * Compose a union validator
	   */
	  composeUnion: function composeUnion(facets, leftValidatorFn, rightValidatorFn, context) {
	    var fragments = [
	    // First perform some type validations
	    'var lErr = ' + leftValidatorFn + '(value, path);', 'var rErr = ' + rightValidatorFn + '(value, path);', 'if (lErr.length === 0) { return []; }', 'if (rErr.length === 0) { return []; }', 'if (lErr.length < rErr.length) {', '\treturn lErr;', '} else {', '\treturn rErr;', '}'];

	    return fragments;
	  },


	  /**
	   * Compose a plain type, only by it's facets
	   */
	  composeFacets: function composeFacets(facets, context) {
	    return _FacetValidators2.default.generateFacetFragments(facets, context);
	  },


	  /**
	   * Compose object properties fragments
	   */
	  composeObjectProperties: function composeObjectProperties(properties, facets, context) {
	    var hasPropsDefined = false;
	    var stringMatchers = [];
	    var regexMatchers = [];
	    var fragments = [];

	    // Pre-process properties and create regex and string-based matchers
	    properties.forEach(function (prop) {
	      var typeValidatorFn = context.uses(prop.range());
	      var key = prop.nameId();
	      var keyRegex = prop.getKeyRegexp();

	      // FIX: When the key looks like a regex, other RAML generators consider
	      //      it a valid regex. However `raml-1-parser` does not understands it,
	      //      keeping the `keyRegex` undefined.
	      if (keyRegex == null && REGEX_MATCHING_REGEX.exec(key)) {
	        keyRegex = key;
	        if (key[0] === '/' && key[key.length - 1] === '/') {
	          keyRegex = key.slice(1, -1);
	        }
	      }

	      // Store on the appropriate list
	      if (!keyRegex) {
	        stringMatchers.push([key, prop.isRequired(), typeValidatorFn]);
	      } else {
	        regexMatchers.push([keyRegex, prop.isRequired(), typeValidatorFn]);
	      }
	    });

	    // If we do have regex-based matchers, we will have to iterate over
	    // each property individually
	    if (regexMatchers.length !== 0) {

	      // Define properties only when needed
	      hasPropsDefined = true;
	      fragments.push('var matched = [];', 'var props = Object.keys(value);');

	      fragments = regexMatchers.reduce(function (fragments, _ref) {
	        var _ref2 = _slicedToArray(_ref, 3),
	            regex = _ref2[0],
	            required = _ref2[1],
	            validatorFn = _ref2[2];

	        var REGEX = context.getConstantExpression('REGEX', '/' + regex + '/');
	        var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'PROP_MISSING_MATCH', 'Missing a property that matches `{name}`');

	        fragments.push('matched = props.filter(function(key) {', '\treturn ' + REGEX + '.exec(key);', '});');

	        // Check for required props
	        if (required) {
	          fragments.push('if (matched.length === 0) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + ', {name: \'' + regex + '\'}));', '}');
	        }

	        // Validate property children
	        return fragments.concat(['errors = matched.reduce(function(errors, property) {', '\treturn errors.concat(' + validatorFn + '(value[property], path.concat([property])));', '}, errors);']);
	      }, fragments);
	    }

	    // Process string-based properties
	    if (stringMatchers.length !== 0) {
	      fragments = stringMatchers.reduce(function (fragments, _ref3) {
	        var _ref4 = _slicedToArray(_ref3, 3),
	            name = _ref4[0],
	            required = _ref4[1],
	            validatorFn = _ref4[2];

	        if (required) {
	          return fragments.concat(HighOrderComposers.composeRequiredProperty(name, validatorFn, context));
	        } else {
	          return fragments.concat(HighOrderComposers.composeProperty(name, validatorFn, context));
	        }
	      }, fragments);
	    }

	    // The `additionalProperties` facet is a bit more complicated, since it
	    // requires traversal thorugh it's keys
	    if (facets.additionalProperties) {
	      var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'PROP_ADDITIONAL_PROPS', 'Unexpected extraneous property `{name}`');

	      // Don't re-define props if we already have them
	      if (!hasPropsDefined) {
	        fragments.push('var props = Object.keys(value);');
	      }

	      // Iterate over properties and check if the validators match
	      fragments = fragments.concat('props.forEach(function(key) {', '\tvar found = false;', stringMatchers.reduce(function (fragments, _ref5) {
	        var _ref6 = _slicedToArray(_ref5, 3),
	            name = _ref6[0],
	            unused1 = _ref6[1],
	            unused2 = _ref6[2];

	        return fragments.concat(['if (key === "' + name + '") found=true;']);
	      }, []), regexMatchers.reduce(function (fragments, _ref7) {
	        var _ref8 = _slicedToArray(_ref7, 3),
	            regex = _ref8[0],
	            unused1 = _ref8[1],
	            unused2 = _ref8[2];

	        var REGEX = context.getConstantExpression('REGEX', '/' + regex + '/');
	        return fragments.concat(['if (' + REGEX + '.exec(key)) found=true;']);
	      }, []), '\tif (!found) {', '\t\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + ', {name: key}));', '\t}'(_templateObject));
	    }

	    return fragments;
	  },


	  /**
	   * Compose a required property framgent
	   */
	  composeRequiredProperty: function composeRequiredProperty(property, validatorFn, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'PROP_MISSING', 'Missing property `{name}`');

	    return ['if (value.' + property + ' == null) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + ', {name: \'' + property + '\'}));', '} else {', '\terrors = errors.concat(' + validatorFn + '(value.' + property + ', path.concat([\'' + property + '\'])));', '}'];
	  },


	  /**
	   * Compose a property framgent
	   */
	  composeProperty: function composeProperty(property, validatorFn, context) {
	    return ['if (value.' + property + ' != null) {', '\terrors = errors.concat(' + validatorFn + '(value.' + property + ', path.concat([\'' + property + '\'])));', '}'];
	  }
	};

	module.exports = HighOrderComposers;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _FragmentFactory = __webpack_require__(10);

	var _FragmentFactory2 = _interopRequireDefault(_FragmentFactory);

	var _GeneratorUtil = __webpack_require__(7);

	var _RAMLUtil = __webpack_require__(5);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NATIVE_TYPE_VALIDATORS = {

	  /**
	   * Number type
	   */
	  NumberType: function NumberType(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_NUMBER', 'Expecting a number');

	    return [].concat('if (isNaN(value)) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Integer type
	   */
	  IntegerType: function IntegerType(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_INTEGER', 'Expecting an integer number');

	    return [].concat('if (isNaN(value) || (value % 1 !== 0)) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Boolean type
	   */
	  BooleanType: function BooleanType(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_BOOLEAN', 'Expecting a boolean value');

	    return [].concat('if ((value !== false) && (value !== true)) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * String type
	   */
	  StringType: function StringType(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_STRING', 'Expecting a string');

	    return [].concat('if (typeof value != "string") {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Date/Time type
	   */
	  DateTimeType: function DateTimeType(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_DATETIME', 'Expecting a date/time string');

	    return [].concat('if (typeof value != "string") {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Object type
	   */
	  object: function object(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_OBJECT', 'Expecting an object');

	    return [].concat('if (typeof value != "object") {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Array type
	   */
	  array: function array(fragments, context) {
	    var ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES', 'TYPE_NOT_ARRAY', 'Expecting an array');

	    return [].concat('if (!Array.isArray(value)) {', '\terrors.push(new RAMLError(path, ' + ERROR_MESSAGE + '));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },

	  /**
	   * Union type
	   */
	  union: function union(fragments, context) {
	    return fragments;
	  }

	};

	module.exports = {

	  /**
	   * Wrap a set of fragments in a condition only if the value passes the native
	   * type test.
	   */
	  wrapWithNativeTypeValidator: function wrapWithNativeTypeValidator(fragments, itype, context) {
	    var typeName = _RAMLUtil2.default.getBuiltinTypeName(itype);
	    if (NATIVE_TYPE_VALIDATORS[typeName] === undefined) {
	      throw TypeError('Unknown native type ' + typeName);
	    }

	    return NATIVE_TYPE_VALIDATORS[typeName](fragments, context);
	  }
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * The following string defines the RAMLError class, instantiated by the
	 * validator when an error occurs.
	 */
	module.exports = "\nconst REPLACE_MESSAGE_TEMPLATE = /\\{([^\\}]+)}/g;\n\nfunction RAMLError(path, message, _messageVariables) {\n  var messageVariables = _messageVariables || {};\n\n  Object.defineProperty(this, 'path', {\n    get: function() {\n      return path;\n    },\n  });\n\n  Object.defineProperty(this, 'message', {\n    get: function() {\n      return message.replace(REPLACE_MESSAGE_TEMPLATE, function(match) {\n        return ''+messageVariables[match.slice(1,-1)] || '';\n      });\n    },\n  });\n}\n";

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _RAMLUtil = __webpack_require__(5);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GeneratorContext = function () {
	  function GeneratorContext() {
	    _classCallCheck(this, GeneratorContext);

	    this.constantTables = {};
	    this.typesProcessed = {};
	    this.typesQueue = [];
	  }

	  /**
	   * This function marks the given type as `required`, scheduling a validator
	   * function to ge generated for it.
	   *
	   * This function returns a string with the expression that represents the
	   * way to call the generated (or will be generated) function.
	   *
	   * @param {ITypeDefinition} itype - The run-time RAML type to generate a validator for
	   * @returns {String} - Returns the function javascript source
	   */


	  _createClass(GeneratorContext, [{
	    key: 'uses',
	    value: function uses(itype) {
	      var name = _RAMLUtil2.default.getTypeName(itype);
	      var callExpr = 'Validators.' + name;

	      if (!this.typesProcessed[name]) {
	        this.typesQueue.push(itype);
	        this.typesProcessed[name] = true;
	      }

	      return callExpr;
	    }

	    /**
	     * Shift the next type in the type queue
	     */

	  }, {
	    key: 'nextTypeInQueue',
	    value: function nextTypeInQueue() {
	      return this.typesQueue.shift();
	    }

	    /**
	     * @param {String} tableName
	     * @param {String} name
	     * @param {String} value
	     */

	  }, {
	    key: 'getConstantString',
	    value: function getConstantString(tableName, name, value) {
	      if (this.constantTables[tableName] == null) {
	        this.constantTables[tableName] = {};
	      }

	      if (this.constantTables[tableName][name] == null) {
	        this.constantTables[tableName][name] = JSON.stringify(value);
	      }

	      // Return constant name
	      return tableName + '.' + name;
	    }
	  }, {
	    key: 'getConstantExpression',
	    value: function getConstantExpression(tableName, expression) {
	      if (this.constantTables[tableName] == null) {
	        this.constantTables[tableName] = [];
	      }

	      var index = this.constantTables[tableName].indexOf(expression);
	      if (index === -1) {
	        index = this.constantTables[tableName].length;
	        this.constantTables[tableName].push(expression);
	      }

	      return tableName + '[' + index + ']';
	    }
	  }]);

	  return GeneratorContext;
	}();

	module.exports = GeneratorContext;

/***/ }
/******/ ]);