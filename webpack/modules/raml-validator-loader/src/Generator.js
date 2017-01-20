import DefaultErrorMessages from './constants/DefaultErrorMessages';
import GeneratorUtil from './utils/GeneratorUtil';
import RAMLErrorPayload from './constants/RAMLErrorPayload';
import RAMLUtil from './utils/RAMLUtil';
import TypeValidator from './generators/TypeValidator';

module.exports = {

  /**
   * Generate a comment as an array of lines from the given string
   *
   * @param {String} desc - The comment string
   * @returns {Array} Returns an array of lines for the comment block
   */
  commentBlock(desc) {
    return [].concat(
      ['/**'],
      desc.split('\n').map((line) => ` * ${line}`),
      [' */']
    );
  },

  /**
   * Generate a full source using the given generator context
   *
   * @param {GeneratorContext} context - The generator context to use
   * @returns {String} The generated module source code
   */
  /* eslint-disable no-cond-assign */
  /* eslint-disable no-continue */
  generate(context) {
    let itype;
    let privateValidatorFragments = [
      'var PrivateValidators = {'
    ];
    let validatorFragments = [
      'var Validators = {'
    ];

    //
    // The following loop generates the validators for every type in the context
    // A validator generator might push more types while it's being processed.
    //
    while ((itype = context.nextTypeInQueue()) != null) {
      const typeName = RAMLUtil.getTypeName(itype);
      let fragments = [];

      // 'Any' is a special case, since it always validates. Therefore we use
      // a shorter alternative that just returns an empty array
      if (typeName === 'any') {
        validatorFragments.push(
          '/**',
          ' * (anything)',
          ' */',
          `\t${typeName}: function(value, _path) { return [] },`,
          ''
        );
        continue;
      }

      // Generate a comment block for this function, using the example provided
      // by the raml parser.
      let comment = itype.examples()[0].expandAsString();
      if (RAMLUtil.isInlineType(itype)) {
        // For inline types we also include a more descriptive comment block,
        // since the function name doesn't really describe their purpose
        comment += '\n\n' + RAMLUtil.getInlineTypeComment(itype);
      }

      // Compose the validator function
      fragments = fragments.concat(
        GeneratorUtil.indentFragments(
          this.commentBlock( comment )
        ),
        [
          `\t${typeName}: function(value, path) {`,
          '\t\tvar errors = [];',
          '\t\tpath = path || [];'
        ],
        GeneratorUtil.indentFragments(
          TypeValidator.generateTypeValidator(itype, context),
          '\t\t'
        ),
        ['\t\treturn errors;',
          '\t},', '']
      );

      // Inline types are stored in a different object, not exposed to the user
      if (RAMLUtil.isInlineType(itype)) {
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
    const defaultErrorMessagesTable = 'var DEFAULT_ERROR_MESSAGES = ' +
      JSON.stringify(
        context.usedErrors.reduce(
          function (table, errorConstant) {
            table[errorConstant] = DefaultErrorMessages[errorConstant];

            return table;
          },
          {}
        ),
        null,
        2
      );

    //
    // While processing the types, the validator generators will populate
    // constants in the global constants table(s).
    //
    const globalTableFragments = [].concat(
      'var DEFAULT_CONTEXT = {',
      GeneratorUtil.indentFragments(
        Object.keys(context.constantTables).reduce(function (lines, tableName) {
          const table = context.constantTables[tableName];
          if (Array.isArray(table)) {
            // Array of anonymous expressions
            return lines.concat(
              [`${tableName}: [`],
              GeneratorUtil.indentFragments( table ).map(function (line) {
                return `${line},`;
              }),
              ['],']
            );
          } else {
            // Object of named expressions
            return lines.concat(
              [`${tableName}: {`],
              GeneratorUtil.indentFragments(
                Object.keys(table).map(function (key) {
                  return `${key}: ${table[key]},`;
                })
              ),
              ['},', '']
            );
          }
        }, [])
      ),
      '}'
    );

    //
    // Compose validator class
    //
    const validatorClass = [].concat(
      'var RAMLValidator = function(config) {',
      GeneratorUtil.indentFragments([].concat(
        'if (!config) config = {};',
        'var context = Object.assign({}, DEFAULT_CONTEXT);',
        '',
        '// Override errorMessages through config',
        'context.ERROR_MESSAGES = Object.assign(',
        '\t{},',
        '\tDEFAULT_ERROR_MESSAGES,',
        '\tconfig.errorMessages',
        ')',
        '',
        privateValidatorFragments,
        '',
        validatorFragments,
        '',
        '// Expose validator functions, bound to local overrides',
        'Object.keys(Validators).forEach((function(key) {',
        '\tthis[key] = Validators[key];',
        '}).bind(this));',
        '',
        '// Expose .clone function that allows further overrides to apply',
        'this.clone = function(cloneConfig) {',
        '\treturn new RAMLValidator(Object.assign(config, cloneConfig));',
        '}'
      )),
      '}'
    );

    //
    // Compose the individual fragments into the full module source
    //
    return [].concat(
      'module.exports = (function() {',
        RAMLErrorPayload,
        defaultErrorMessagesTable,
        '',
        globalTableFragments,
        '',
        validatorClass,
        '',
        'return new RAMLValidator();',
      '})();'
    ).join('\n');
  }
  /* eslint-enable no-cond-assign */
  /* eslint-enable no-continue */

};
