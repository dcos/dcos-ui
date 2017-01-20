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

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _fs = __webpack_require__(1);

	var _fs2 = _interopRequireDefault(_fs);

	var _raml1Parser = __webpack_require__(2);

	var _raml1Parser2 = _interopRequireDefault(_raml1Parser);

	var _Generator = __webpack_require__(3);

	var _Generator2 = _interopRequireDefault(_Generator);

	var _GeneratorContext = __webpack_require__(14);

	var _GeneratorContext2 = _interopRequireDefault(_GeneratorContext);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Entry point of the raml-validator-loader
	 *
	 * @param {String} source - The source code of the RAML document
	 * @returns {String} Returns the transpiled JS code blob
	 */
	module.exports = function (source) {
	  var _this = this;

	  // Mark the contents cacheable
	  this.cacheable();

	  // Override the default filesystem resolver in order to:
	  //
	  // 1) Provide a custom content for the source file
	  // 2) Track dependent files in order for webpack to invalidate caches
	  //
	  var raml = _raml1Parser2.default.loadApiSync(this.resourcePath, {
	    fsResolver: {
	      content: function content(path) {
	        if (path === _this.resourcePath) {
	          return source;
	        }

	        // When RAML loader is requesting a file, trackit as a dependency
	        // so webpack can do it's magic internally.
	        _this.addDependency(path);

	        return _fs2.default.readFileSync(path).toString();
	      }
	    }
	  });

	  // Parse URL parameters to generator configuration
	  var config = {};
	  if (this.query) {
	    var query = this.query.substr(1);
	    if (query[0] === '{') {
	      config = JSON.parse(query);
	    } else {
	      config = query.split('&').reduce(function (memo, kv) {
	        var _kv$split = kv.split('='),
	            _kv$split2 = _slicedToArray(_kv$split, 2),
	            key = _kv$split2[0],
	            value = _kv$split2[1];

	        if (!key) {
	          return memo;
	        }

	        // Do some type conversion
	        if (value === 'true') {
	          value = true;
	        } else if (value === 'false') {
	          value = false;
	        } else if (!isNaN(value)) {
	          value = Number(value);
	        }

	        // Keep the config
	        memo[key] = value;

	        return memo;
	      }, {});
	    }
	  }

	  // Prepare generator context
	  var ctx = new _GeneratorContext2.default(config);

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

	module.exports = require("raml-1-parser");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _DefaultErrorMessages = __webpack_require__(4);

	var _DefaultErrorMessages2 = _interopRequireDefault(_DefaultErrorMessages);

	var _GeneratorUtil = __webpack_require__(5);

	var _GeneratorUtil2 = _interopRequireDefault(_GeneratorUtil);

	var _RAMLErrorPayload = __webpack_require__(6);

	var _RAMLErrorPayload2 = _interopRequireDefault(_RAMLErrorPayload);

	var _RAMLUtil = __webpack_require__(7);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	var _TypeValidator = __webpack_require__(9);

	var _TypeValidator2 = _interopRequireDefault(_TypeValidator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {

	  /**
	   * Generate a comment as an array of lines from the given string
	   *
	   * @param {String} desc - The comment string
	   * @returns {Array} Returns an array of lines for the comment block
	   */
	  commentBlock: function commentBlock(desc) {
	    return [].concat(['/**'], desc.split('\n').map(function (line) {
	      return ' * ' + line;
	    }), [' */']);
	  },


	  /**
	   * Generate a full source using the given generator context
	   *
	   * @param {GeneratorContext} context - The generator context to use
	   * @returns {String} The generated module source code
	   */
	  /* eslint-disable no-cond-assign */
	  /* eslint-disable no-continue */
	  generate: function generate(context) {
	    var itype = void 0;
	    var privateValidatorFragments = ['var PrivateValidators = {'];
	    var validatorFragments = ['var Validators = {'];

	    //
	    // The following loop generates the validators for every type in the context
	    // A validator generator might push more types while it's being processed.
	    //
	    while ((itype = context.nextTypeInQueue()) != null) {
	      var typeName = _RAMLUtil2.default.getTypeName(itype);
	      var fragments = [];

	      // 'Any' is a special case, since it always validates. Therefore we use
	      // a shorter alternative that just returns an empty array
	      if (typeName === 'any') {
	        validatorFragments.push('/**', ' * (anything)', ' */', '\t' + typeName + ': function(value, _path) { return [] },', '');
	        continue;
	      }

	      // Generate a comment block for this function, using the example provided
	      // by the raml parser.
	      var comment = itype.examples()[0].expandAsString();
	      if (_RAMLUtil2.default.isInlineType(itype)) {
	        // For inline types we also include a more descriptive comment block,
	        // since the function name doesn't really describe their purpose
	        comment += '\n\n' + _RAMLUtil2.default.getInlineTypeComment(itype);
	      }

	      // Compose the validator function
	      fragments = fragments.concat(_GeneratorUtil2.default.indentFragments(this.commentBlock(comment)), ['\t' + typeName + ': function(value, path) {', '\t\tvar errors = [];', '\t\tpath = path || [];'], _GeneratorUtil2.default.indentFragments(_TypeValidator2.default.generateTypeValidator(itype, context), '\t\t'), ['\t\treturn errors;', '\t},', '']);

	      // Inline types are stored in a different object, not exposed to the user
	      if (_RAMLUtil2.default.isInlineType(itype)) {
	        privateValidatorFragments = privateValidatorFragments.concat(fragments);
	      } else {
	        validatorFragments = validatorFragments.concat(fragments);
	      }
	    }

	    // Finalize the private and public validator fragments
	    privateValidatorFragments.push('};');
	    validatorFragments.push('};');

	    //
	    // Compose default error messages, by keeping only the error
	    // messages used by the validators
	    //
	    var defaultErrorMessagesTable = 'var DEFAULT_ERROR_MESSAGES = ' + JSON.stringify(context.usedErrors.reduce(function (table, errorConstant) {
	      table[errorConstant] = _DefaultErrorMessages2.default[errorConstant];

	      return table;
	    }, {}), null, 2);

	    //
	    // While processing the types, the validator generators will populate
	    // constants in the global constants table(s).
	    //
	    var globalTableFragments = [].concat('var DEFAULT_CONTEXT = {', _GeneratorUtil2.default.indentFragments(Object.keys(context.constantTables).reduce(function (lines, tableName) {
	      var table = context.constantTables[tableName];
	      if (Array.isArray(table)) {
	        // Array of anonymous expressions
	        return lines.concat([tableName + ': ['], _GeneratorUtil2.default.indentFragments(table).map(function (line) {
	          return line + ',';
	        }), ['],']);
	      } else {
	        // Object of named expressions
	        return lines.concat([tableName + ': {'], _GeneratorUtil2.default.indentFragments(Object.keys(table).map(function (key) {
	          return key + ': ' + table[key] + ',';
	        })), ['},', '']);
	      }
	    }, [])), '}');

	    //
	    // Compose validator class
	    //
	    var validatorClass = [].concat('var RAMLValidator = function(config) {', _GeneratorUtil2.default.indentFragments([].concat('if (!config) config = {};', 'var context = Object.assign({}, DEFAULT_CONTEXT);', '', '// Override errorMessages through config', 'context.ERROR_MESSAGES = Object.assign(', '\t{},', '\tDEFAULT_ERROR_MESSAGES,', '\tconfig.errorMessages', ')', '', privateValidatorFragments, '', validatorFragments, '', '// Expose validator functions, bound to local overrides', 'Object.keys(Validators).forEach((function(key) {', '\tthis[key] = Validators[key];', '}).bind(this));', '', '// Expose .clone function that allows further overrides to apply', 'this.clone = function(cloneConfig) {', '\treturn new RAMLValidator(Object.assign(config, cloneConfig));', '}')), '}');

	    //
	    // Compose the individual fragments into the full module source
	    //
	    return [].concat('module.exports = (function() {', _RAMLErrorPayload2.default, defaultErrorMessagesTable, '', globalTableFragments, '', validatorClass, '', 'return new RAMLValidator();', '})();').join('\n');
	  }
	  /* eslint-enable no-cond-assign */
	  /* eslint-enable no-continue */

	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Every time you are about to write a description for the error message
	 * make sure that it sounds natural when prefixed with "The service"
	 *
	 * For example: "The service must be one of {{values}}"
	 *
	 * This can produce a more natural error description when used
	 */
	var DefaultErrorMessages = {
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

	exports.default = DefaultErrorMessages;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {

	  /**
	   * Indent the given fragments
	   *
	   * @param {Array} fragments - An array with the code lines
	   * @param {String} [prefix] - The prefix to prepend for indentation
	   * @returns {Array} - Returns the indented code lines
	   */
	  indentFragments: function indentFragments(fragments) {
	    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\t';

	    return fragments.map(function (line) {
	      return '' + prefix + line;
	    });
	  }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * The following string defines the RAMLError class, instantiated by the
	 * validator when an error occurs.
	 */
	module.exports = "\nconst REPLACE_MESSAGE_TEMPLATE = /\\{\\{([^\\}]+)\\}\\}/g;\n\nfunction RAMLError(path, context, type, _messageVariables) {\n  var messageVariables = _messageVariables || {};\n  var message = context.ERROR_MESSAGES[type];\n  Object.defineProperties(this, {\n    message: {\n      enumerable: true,\n      get: function() {\n        if (typeof message === 'function') {\n          return message(messageVariables, path);\n        }\n\n        return message.replace(REPLACE_MESSAGE_TEMPLATE, function(match) {\n          return ''+messageVariables[match.slice(2,-2)] || '';\n        });\n      }\n    },\n    path: {\n      enumerable: true,\n      value: path\n    },\n    type: {\n      enumerable: true,\n      value: type\n    },\n    variables: {\n      enumerable: true,\n      value: messageVariables\n    }\n  });\n}\n";

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _crypto = __webpack_require__(8);

	var _crypto2 = _interopRequireDefault(_crypto);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {

	  /**
	   * This function checks if the given runtime type is an inline definition,
	   * since such definitions needs further specialization.
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
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition to check
	   * @returns {Boolean} Returns true if this type is an in-line definition
	   */
	  isInlineType: function isInlineType(itype) {
	    // So, a type that has no name, but is either an array or a value type
	    // is considered an in-line definition, and has a dedicated specialization
	    return itype.nameId() == null && (itype.isArray() || itype.isValueType());
	  },


	  /**
	   * This function checks if the given internal type is an inline array
	   * definition of a known type. Such definitions need a different name, yet
	   * they remain exposed on the `Validators` object.
	   *
	   * For example:
	   *
	   * properties:
	   *   arrayProp: SomeType[]
	   *
	   * Should generate a validator named `SomeTypeAsArray` instead of an anonymous
	   * validator like inline.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition to check
	   * @returns {Boolean} Returns true if this type is an in-line array
	   */
	  isArrayOfType: function isArrayOfType(itype) {
	    return itype.nameId() === '' && itype.isArray();
	  },


	  /**
	   * Return a comment that describes this inline type
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
	   * @returns {String} The comment to the specialized inline type
	   */
	  getInlineTypeComment: function getInlineTypeComment(itype) {
	    var facets = itype.getFixedFacets();
	    var comment = 'This is an in-line specialization of ' + this.getInlineTypeBase(itype) + '\nwith the following constraints:\n\n';

	    return comment + Object.keys(facets).map(function (name) {
	      if (name === 'items') {
	        return '- ' + name + ': ' + this.getTypeName(facets[name].extras.nominal);
	      } else {
	        return '- ' + name + ': ' + facets[name];
	      }
	    }, this).join('\n');
	  },


	  /**
	   * Returns the base type of the given in-line type definition
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
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
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
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
	   * The name of the in-line array type.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
	   * @returns {String} Returns a string with the name of the given type
	   */
	  getArrayOfTypeName: function getArrayOfTypeName(itype) {
	    return this.getTypeName(itype.componentType()) + 'AsArray';
	  },


	  /**
	   * This function tries to put a name on the given run-time RAML definition.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
	   * @returns {String} Returns a string with the name of the given type
	   */
	  getTypeName: function getTypeName(itype) {

	    //
	    // Inline types are processed first. These are:
	    //
	    //   TypeA:
	    //     properties:
	    //       # An anonymous array type
	    //       case1:
	    //         type: array
	    //         items: string
	    //       # An anonymous primitive type
	    //       case2:
	    //         type: number
	    //         minValue: 0
	    //
	    if (this.isInlineType(itype)) {
	      return this.getInlineTypeName(itype);
	    }

	    //
	    // Check if this is an array of a known type. This is:
	    //
	    //   TypeA:
	    //     properties:
	    //       # In-line array definition of known type
	    //       case1: string[]
	    //
	    if (this.isArrayOfType(itype)) {
	      return this.getArrayOfTypeName(itype);
	    }

	    //
	    // If the type is still anonymous, try to lookup it's type by
	    // traversing the super classes
	    //
	    if (itype.nameId() == null || itype.nameId() === '') {
	      return this.getTypeName(itype.superTypes()[0]);
	    }

	    // Return type name
	    return itype.nameId();
	  },


	  /**
	   * Get the group where this type should be registered
	   *
	   * This is either `Validators`, exposed to the user, or `PrivateValidators`,
	   * internally maintained.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of the RAML definition
	   * @returns {string} Returns the name of the group where this type should be added
	   */
	  getTypeGroup: function getTypeGroup(itype) {
	    if (this.isInlineType(itype)) {
	      return 'PrivateValidators';
	    } else {
	      return 'Validators';
	    }
	  },


	  /**
	   * Return the reference to the given type
	   *
	   * @param {ITypeDefinition} itype - The runtime type of the RAML definition
	   * @returns {string} Returns the code reference to the given type
	   */
	  getTypeRef: function getTypeRef(itype) {
	    return this.getTypeGroup(itype) + '.' + this.getTypeName(itype);
	  },


	  /**
	   * This function walks up the type tree until it reaches a native type
	   * and then returns it's type.
	   *
	   * @param {ITypeDefinition} itype - The runtime type of the RAML definition
	   * @returns {ITypeDefinition|null} The builtin type or null if not found
	   */
	  getBuiltinType: function getBuiltinType(itype) {
	    if (itype.isBuiltIn()) {
	      return itype;
	    }

	    return itype.allSuperTypes().find(function (type) {
	      return type.isBuiltIn();
	    });
	  },


	  /**
	   * Return the name of a builtin type
	   *
	   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
	   * @returns {string|null} The builtin type name or null if not found
	   */
	  getBuiltinTypeName: function getBuiltinTypeName(itype) {
	    var builtinType = this.getBuiltinType(itype);
	    if (builtinType == null) {
	      return null;
	    }

	    return builtinType.nameId();
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _HighOrderComposers = __webpack_require__(10);

	var _HighOrderComposers2 = _interopRequireDefault(_HighOrderComposers);

	var _NativeValidators = __webpack_require__(13);

	var _NativeValidators2 = _interopRequireDefault(_NativeValidators);

	var _RAMLUtil = __webpack_require__(7);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Collect union types, from possibly nested unions
	 *
	 * @param {IUnionType} itype - The Union run-time RAML type to collect union types for
	 * @returns {Array} Returns an array of union types that compose this union
	 */
	function collectUnionTypes(itype) {
	  if (!itype.isUnion()) {
	    return [itype];
	  } else {
	    return [].concat(collectUnionTypes(itype.leftType()), collectUnionTypes(itype.rightType()));
	  }
	}

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
	    var fragments = [];

	    // We first use the high-order composers to generate the base code
	    // depending on the major classifications of the validators
	    if (itype.isUnion()) {
	      var unionTypes = collectUnionTypes(itype);
	      var unionValidators = unionTypes.map(function (itype) {
	        return context.uses(itype);
	      });
	      fragments = _HighOrderComposers2.default.composeUnion(itype.getFixedFacets(), unionValidators, context);
	    } else {
	      fragments = _HighOrderComposers2.default.composeFacets(itype.getFixedFacets(), context);
	    }

	    // If we have an object, iterate over it's properties and create
	    // validation constraints
	    if (itype.isObject()) {
	      fragments = fragments.concat(_HighOrderComposers2.default.composeObjectProperties(itype.allProperties(), itype, context));
	    }

	    // Wrap everything in type validation
	    var type = _RAMLUtil2.default.getBuiltinType(itype);

	    return _NativeValidators2.default.wrapWithNativeTypeValidator(fragments, type, context);
	  }
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _FacetValidators = __webpack_require__(11);

	var _FacetValidators2 = _interopRequireDefault(_FacetValidators);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * This is a hackish way to read the contents of the `additionalProperties`
	 * facet value. That's because the ITypeDefinition API is not populating that
	 * facet in the `getFixedFacets()` function.
	 *
	 * So, we are looking up the type adapter (that RAML uses for type validation
	 * internally), and we are looking up on it's metadata for the
	 * `KnownPropertyRestriction`. The value of this restriction is the value of
	 * the `additionalProperties` facet.
	 *
	 * @param {ITypeDefinition} itype - The type to extract the value from
	 * @param {boolean} defaultValue - The default value if the facet is not found
	 * @returns {boolean} Returns the value of the additionalProperties facet
	 */
	function getAdditionalPropertiesValue(itype) {
	  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


	  // Locate the type adapter
	  var typeAdapter = itype.getAdapters().find(function (adapter) {
	    return adapter.constructor.name === 'InheritedType';
	  });
	  if (!typeAdapter) {
	    return defaultValue;
	  }

	  // The metadata KnownPropertyRestriction is defined when the
	  // additionalProperties facet is defined and it's value contains
	  // the facet's value
	  var knownProperty = typeAdapter.meta().find(function (meta) {
	    return meta.constructor.name === 'KnownPropertyRestriction';
	  });
	  if (!knownProperty) {
	    return defaultValue;
	  }

	  return knownProperty.value();
	}

	var HighOrderComposers = {

	  /**
	   * Compose a union validator
	   *
	   * @param {Object} facets - An object with all the facets in the type
	   * @param {Array} unionValidatorFns - The names of the type validation
	   *   functions taking place in the union.
	   * @return {Array} - The union validator code lines
	   */
	  composeUnion: function composeUnion(facets, unionValidatorFns) {
	    var fragments = [].concat('errors = errors.concat([',

	    // Run the union validation type for every possible union type
	    unionValidatorFns.map(function (typeValidatorFn) {
	      return '\t' + typeValidatorFn + '(value, path),';
	    }),

	    // Sort the validator responses by the number of errors, ascending
	    '].sort(function(a, b) {', '\treturn a.length - b.length;',

	    //
	    // Pick the validation with the fewest possible errors
	    //
	    // If == 0 : The union type validation succeeded
	    // If  > 0 : The union with the fewest errors, and therefore the most
	    //           probable match.
	    //
	    '})[0]);');

	    return fragments;
	  },


	  /**
	   * Compose a plain type, validated only by it's facets
	   *
	   * @param {Object} facets - An object with all the facets in the type
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  composeFacets: function composeFacets(facets, context) {
	    return _FacetValidators2.default.generateFacetFragments(facets, context);
	  },


	  /**
	   * Compose object properties type validator
	   *
	   * @param {Array} properties - An array of IProperty instances
	   * @param {ITypeDefinition} itype - The RAML type that has these properties
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  composeObjectProperties: function composeObjectProperties(properties, itype, context) {
	    var REGEX_MATCHING_REGEX = /[\[\]\(\)\{\}\\\^\$\.\|\?\*\+/]/g;
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
	        var isRequired = false;

	        if (!context.options.patternPropertiesAreOptional) {
	          isRequired = prop.isRequired();
	        }

	        regexMatchers.push([keyRegex, isRequired, typeValidatorFn]);
	      }
	    });

	    // If we do have regex-based matchers, we will have to iterate over
	    // each property individually
	    if (regexMatchers.length !== 0) {

	      // Define properties only when needed
	      hasPropsDefined = true;
	      fragments.push('var matched = [];', 'var props = Object.keys(value);');

	      // If we are mixing regex properties and regular ones, exclude regular
	      // properties from being processed as regex
	      var outliers = stringMatchers.map(function (match) {
	        return match[0];
	      });
	      if (outliers.length) {
	        fragments.push('var regexProps = props.filter(function(key) {', '\treturn ' + JSON.stringify(outliers) + '.indexOf(key) === -1;', '});');
	      } else {
	        fragments.push('var regexProps = props;');
	      }

	      fragments = regexMatchers.reduce(function (fragments, _ref) {
	        var _ref2 = _slicedToArray(_ref, 3),
	            regex = _ref2[0],
	            required = _ref2[1],
	            validatorFn = _ref2[2];

	        var REGEX = context.getConstantExpression('REGEX', 'new RegExp(\'' + regex.replace(/'/g, '\\\'') + '\')');

	        fragments.push('matched = regexProps.filter(function(key) {', '\treturn ' + REGEX + '.exec(key);', '});');

	        // Check for required props
	        if (required) {
	          context.useError('PROP_MISSING_MATCH');
	          fragments.push('if (matched.length === 0) {', '\terrors.push(new RAMLError(path, context, "PROP_MISSING_MATCH", {pattern: \'' + regex + '\'}));', '}');
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
	    // requires traversal through it's keys
	    if (getAdditionalPropertiesValue(itype) === false) {

	      // Don't re-define props if we already have them
	      if (!hasPropsDefined) {
	        fragments.push('var props = Object.keys(value);');
	      }

	      context.useError('PROP_ADDITIONAL_PROPS');

	      // Iterate over properties and check if the validators match
	      fragments = fragments.concat('props.forEach(function(key) {', stringMatchers.reduce(function (fragments, _ref5) {
	        var _ref6 = _slicedToArray(_ref5, 3),
	            name = _ref6[0],
	            _ = _ref6[1],
	            __ = _ref6[2];

	        return fragments.concat(['\tif (key === "' + name + '") return;']);
	      }, []), regexMatchers.reduce(function (fragments, _ref7) {
	        var _ref8 = _slicedToArray(_ref7, 3),
	            regex = _ref8[0],
	            _ = _ref8[1],
	            __ = _ref8[2];

	        var REGEX = context.getConstantExpression('REGEX', 'new RegExp(\'' + regex.replace(/'/g, '\\\'') + '\')');

	        return fragments.concat(['if (' + REGEX + '.exec(key)) return;']);
	      }, []), '\terrors.push(new RAMLError(path, context, "PROP_ADDITIONAL_PROPS", {name: key}));', '});');
	    }

	    return fragments;
	  },


	  /**
	   * Compose a required property validator fragment
	   *
	   * @param {String} property - The name of the property
	   * @param {String} validatorFn - The name of the type validator function
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  composeRequiredProperty: function composeRequiredProperty(property, validatorFn, context) {
	    var errorPath = 'path';
	    var ERROR_TYPE = void 0;

	    // If we are configured to show missing properties to their own path use
	    // different error message and different error path.
	    if (context.options.missingPropertiesOnTheirPath) {
	      errorPath = 'path.concat([\'' + property + '\'])';
	      ERROR_TYPE = 'PROP_IS_MISSING';
	    } else {
	      ERROR_TYPE = 'PROP_MISSING';
	    }

	    context.useError(ERROR_TYPE);

	    return ['if (value.' + property + ' == null) {', '\terrors.push(new RAMLError(' + errorPath + ', context, "' + ERROR_TYPE + '", {name: \'' + property + '\'}));', '} else {', '\terrors = errors.concat(' + validatorFn + '(value.' + property + ', path.concat([\'' + property + '\'])));', '}'];
	  },


	  /**
	   * Compose a property validator fragment
	   *
	   * @param {String} property - The name of the property
	   * @param {String} validatorFn - The name of the type validator function
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  /* eslint-disable no-unused-vars */
	  composeProperty: function composeProperty(property, validatorFn, context) {
	    /* eslint-enable no-unused-vars */
	    return ['if (value.' + property + ' != null) {', '\terrors = errors.concat(' + validatorFn + '(value.' + property + ', path.concat([\'' + property + '\'])));', '}'];
	  }
	};

	module.exports = HighOrderComposers;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _FragmentFactory = __webpack_require__(12);

	var _FragmentFactory2 = _interopRequireDefault(_FragmentFactory);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var FACET_FRAGMENT_GENERATORS = {

	  /**
	   * [Number]  `maximum`: Maximum numeric value
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  maximum: function maximum(value, context) {
	    context.useError('NUMBER_MAX');

	    return _FragmentFactory2.default.testAndPushError('value > ' + value, 'NUMBER_MAX', { value: value });
	  },


	  /**
	   * [Number] `minimum`: Minimum numeric value
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  minimum: function minimum(value, context) {
	    context.useError('NUMBER_MIN');

	    return _FragmentFactory2.default.testAndPushError('value < ' + value, 'NUMBER_MIN', { value: value });
	  },


	  /**
	   * [Number] `format` : The format of the value
	   *
	   * Must be one of: int32, int64, int, long, float, double, int16, int8
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  format: function format(value, context) {
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

	    context.useError('NUMBER_TYPE');

	    return _FragmentFactory2.default.testAndPushError('!(' + condition + ')', 'NUMBER_TYPE', { type: value });
	  },


	  /**
	   * [Number] `multipleOf` : Value must be divisible by this value
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  multipleOf: function multipleOf(value, context) {
	    context.useError('NUMBER_MULTIPLEOF');

	    return _FragmentFactory2.default.testAndPushError('value % ' + value + ' !== 0', 'NUMBER_MULTIPLEOF', { value: value });
	  },


	  /**
	   * [String] `pattern`: Regular expression this value should match against
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  pattern: function pattern(value, context) {
	    var REGEX = context.getConstantExpression('REGEX', 'new RegExp(\'' + value.replace(/'/g, '\\\'') + '\')');

	    context.useError('STRING_PATTERN');

	    return _FragmentFactory2.default.testAndPushError('!' + REGEX + '.exec(value)', 'STRING_PATTERN', { pattern: value });
	  },


	  /**
	   * [String] `minLength`: Minimum length of the string
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  minLength: function minLength(value, context) {
	    context.useError('LENGTH_MIN');

	    return _FragmentFactory2.default.testAndPushError('value.length < ' + value, 'LENGTH_MIN', { value: value });
	  },


	  /**
	   * [String] `maxLength`: Maximum length of the string
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  maxLength: function maxLength(value, context) {
	    context.useError('LENGTH_MAX');

	    return _FragmentFactory2.default.testAndPushError('value.length > ' + value, 'LENGTH_MAX', { value: value });
	  },


	  /**
	   * [Array] `minItems` : Minimum amount of items in the array
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  minItems: function minItems(value, context) {
	    context.useError('ITEMS_MIN');

	    return _FragmentFactory2.default.testAndPushError('value.length < ' + value, 'ITEMS_MIN', { value: value });
	  },


	  /**
	   * [Array] `maxItems` : Maximum amount of items in the array
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  maxItems: function maxItems(value, context) {
	    context.useError('ITEMS_MAX');

	    return _FragmentFactory2.default.testAndPushError('value.length > ' + value, 'ITEMS_MAX', { value: value });
	  },


	  /**
	   * [Array] `uniqueItems` : All array items MUST be unique
	   *
	   * @param {Boolean} value - True if the items must be unique
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  uniqueItems: function uniqueItems(value, context) {
	    context.useError('ITEMS_UNIQUE');

	    return ['if ((function() {', '\tvar valuesSoFar = Object.create(null);', '\tfor (var i = 0; i < value.length; ++i) {', '\t\tvar val = value[i];', '\t\tif (val in valuesSoFar) {', '\t\t\treturn true;', '\t\t}', '\t\tvaluesSoFar[val] = true;', '\t}', '\treturn false;', '})()) {', '\terrors.push(new RAMLError(path, context, "ITEMS_UNIQUE"));', '}'];
	  },


	  /**
	   * [Array] `items` : Type for the items
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
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
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  minProperties: function minProperties(value, context) {
	    context.useError('PROPS_MIN');

	    return _FragmentFactory2.default.testAndPushError('Object.keys(value).length < ' + value, 'PROPS_MIN', { value: value });
	  },


	  /**
	   * [Object] `maxProperties`: Maximum number of properties
	   *
	   * @param {String} value - The facet value
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  maxProperties: function maxProperties(value, context) {
	    context.useError('PROPS_MAX');

	    return _FragmentFactory2.default.testAndPushError('Object.keys(value).length > ' + value, 'PROPS_MAX', { value: value });
	  },


	  /**
	   * [General] `enum`: Enumeration of the given values
	   *
	   * @param {Array} values - The enum options
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The facet validator code lines
	   */
	  enum: function _enum(values, context) {
	    context.useError('ENUM');

	    // If we have caseInsensitiveEnums option defined, convert everything
	    // in lower-case and also use a lower-case test
	    if (context.options.caseInsensitiveEnums) {
	      var LOWER_VALUES = values.map(function (value) {
	        return String(value).toLowerCase();
	      });
	      var _ENUM_STRING = LOWER_VALUES.join(', ');
	      var _ENUM = context.getConstantExpression('ENUMS', JSON.stringify(LOWER_VALUES));

	      return _FragmentFactory2.default.testAndPushError(_ENUM + '.indexOf(value.toLowerCase()) === -1', 'ENUM', { values: _ENUM_STRING });
	    }

	    var ENUM = context.getConstantExpression('ENUMS', JSON.stringify(values));
	    var ENUM_STRING = values.map(function (value) {
	      return String(value);
	    }).join(', ');

	    return _FragmentFactory2.default.testAndPushError(ENUM + '.indexOf(value) === -1', 'ENUM', { values: ENUM_STRING });
	  },


	  /**
	   * This is only a placeholder in order to avoid throwing an error
	   * when this facet is encountered.
	   *
	   * Implemented in the HighOrderComposers, since it's not so simple to be
	   * implemented as a facet validator.
	   *
	   * @return {Array} - The facet validator code lines
	   */
	  additionalProperties: function additionalProperties() {
	    return [];
	  }
	};

	module.exports = {

	  /**
	   * Generate an array of code fragments that perform the validations as
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
/* 12 */
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

	    return ['if (' + testExpr + ') {', '\terrors.push(new RAMLError(path, context, "' + errorConstant + '", ' + variablesExpr + '));', '}'];
	  }
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _GeneratorUtil = __webpack_require__(5);

	var _RAMLUtil = __webpack_require__(7);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var NATIVE_TYPE_VALIDATORS = {

	  /**
	   * Any
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  /* eslint-disable no-unused-vars */
	  any: function any(fragments, context) {
	    /* eslint-enable no-unused-vars */
	    // Everything passes
	    return [];
	  },


	  /**
	   * Nil
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  nil: function nil(fragments, context) {
	    context.useError('TYPE_NOT_NULL');

	    return [].concat('if (value !== null) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_NULL"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Number type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  NumberType: function NumberType(fragments, context) {
	    context.useError('TYPE_NOT_NUMBER');

	    return [].concat('if (isNaN(value)) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_NUMBER"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Integer type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  IntegerType: function IntegerType(fragments, context) {
	    context.useError('TYPE_NOT_INTEGER');

	    return [].concat('if (isNaN(value) || (value % 1 !== 0)) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_INTEGER"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Boolean type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  BooleanType: function BooleanType(fragments, context) {
	    context.useError('TYPE_NOT_BOOLEAN');

	    return [].concat('if ((value !== false) && (value !== true)) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_BOOLEAN"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * String type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  StringType: function StringType(fragments, context) {
	    context.useError('TYPE_NOT_STRING');

	    return [].concat('if (typeof value != "string") {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_STRING"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Date/Time type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  DateTimeType: function DateTimeType(fragments, context) {
	    context.useError('TYPE_NOT_DATETIME');

	    return [].concat('if (isNaN(new Date(value).getTime())) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_DATETIME"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Object type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  object: function object(fragments, context) {
	    context.useError('TYPE_NOT_OBJECT');

	    return [].concat('if ((typeof value != "object") || (value === null)) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_OBJECT"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Array type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  array: function array(fragments, context) {
	    context.useError('TYPE_NOT_ARRAY');

	    return [].concat('if (!Array.isArray(value)) {', '\terrors.push(new RAMLError(path, context, "TYPE_NOT_ARRAY"));', '} else {', (0, _GeneratorUtil.indentFragments)(fragments), '}');
	  },


	  /**
	   * Union type
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
	   */
	  /* eslint-disable no-unused-vars */
	  union: function union(fragments, context) {
	    /* eslint-enable no-unused-vars */
	    return fragments;
	  }
	};

	module.exports = {

	  /**
	   * Wrap a set of fragments in a condition only if the value passes the native
	   * type test.
	   *
	   * @param {Array} fragments - The validator fragment code lines so far
	   * @param {ITypeDefinition} itype - The RAML type to create validation for
	   * @param {GeneratorContext} context - The current generator context
	   * @return {Array} - The type validator code lines
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _RAMLUtil = __webpack_require__(7);

	var _RAMLUtil2 = _interopRequireDefault(_RAMLUtil);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GeneratorContext = function () {
	  function GeneratorContext() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, GeneratorContext);

	    // Configuration parameters that define the behavior of the parser in some
	    // corner cases
	    this.options = {

	      /**
	       * If this flag is set to `true` all pattern properties are considered
	       * optional. By default the parser will query the `raml-1-parser` library,
	       * and it always return `isRequired() = true`.
	       *
	       * @property {boolean}
	       */
	      patternPropertiesAreOptional: true,

	      /**
	       * If this flag is set to `true`, all missing properties will be emitted
	       * in their path. For example, if property `foo` is missing on the object
	       * `bar`, you will get an error:
	       *
	       * `bar.foo`: Missing property
	       *
	       * Instead of the default:
	       *
	       * `foo`: Missing property `bar`
	       *
	       * @property {boolean}
	       */
	      missingPropertiesOnTheirPath: true,

	      /**
	       * If this flag is set to `true` all enum comparisons will be done
	       * case-insensitive.
	       *
	       * @property {boolean}
	       */
	      caseInsensitiveEnums: true

	    };

	    this.constantTables = {};
	    this.typesProcessed = {};
	    this.typesQueue = [];
	    this.options = Object.assign(this.options, options);
	    this.usedErrors = [];
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
	      var ref = _RAMLUtil2.default.getTypeRef(itype);

	      if (!this.typesProcessed[ref]) {
	        this.typesQueue.push(itype);
	        this.typesProcessed[ref] = true;
	      }

	      return ref;
	    }

	    /**
	     * Mark a particular error constant as used.
	     *
	     * This approach is used as an optimisation in order to reduce the total
	     * number of error messages included for smaller output size, when some
	     * of them are not used.
	     *
	     * @param {String} errorConstant - The error constant
	     */

	  }, {
	    key: 'useError',
	    value: function useError(errorConstant) {
	      if (this.usedErrors.indexOf(errorConstant) !== -1) {
	        return;
	      }

	      this.usedErrors.push(errorConstant);
	    }

	    /**
	     * Shift the next type in the type queue
	     *
	     * @returns {ITypeDefinition|undefined} The next item on queue or undefined if empty
	     */

	  }, {
	    key: 'nextTypeInQueue',
	    value: function nextTypeInQueue() {
	      return this.typesQueue.shift();
	    }

	    /**
	     * Create a constant string in the string table and return a code reference
	     * to it
	     *
	     * @param {String} tableName - The name of the table to put a string into
	     * @param {String} name - The name of the string
	     * @param {String} value - The value of the string
	     * @returns {String} The code reference to the table entry
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
	      return 'context.' + tableName + '.' + name;
	    }

	    /**
	     * Create a constant expression and get a code reference to it
	     *
	     * @param {String} tableName - The name of the table to put a string into
	     * @param {String} expression - The constant expression
	     * @returns {String} The code reference to the table entry
	     */

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

	      return 'context.' + tableName + '[' + index + ']';
	    }
	  }]);

	  return GeneratorContext;
	}();

	module.exports = GeneratorContext;

/***/ }
/******/ ]);