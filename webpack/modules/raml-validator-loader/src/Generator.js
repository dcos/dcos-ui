import RAMLUtil from './utils/RAMLUtil';
import GeneratorUtil from './utils/GeneratorUtil';
import TypeValidator from './generators/TypeValidator';
import RAMLErrorPayload from './payloads/RAMLError';

module.exports = {

  /**
   * Generate a comment as an array of lines from the given string
   *
   * @param {String} desc - The comment string
   * @returns {Array} Returns an array of lines for the comment block
   */
  commentBlock: function(desc) {
    return [].concat(
      [ '/**' ],
      desc.split('\n').map((line) => ` * ${line}`),
      [ ' */']
    );
  },

  /**
   * Generate a full source using the given generator context
   *
   * @param {GeneratorContext} ctx - The generator context to use
   * @returns {String} The generated module source code
   */
  generate: function(ctx) {
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
    while (itype = ctx.nextTypeInQueue()) {
      let typeName = RAMLUtil.getTypeName(itype);
      let fragments = [];

      // 'Any' is a special case, since it always validates. Therefore we use
      // a shorter alternative that just returns an empty array
      if (typeName === 'any') {
        validatorFragments.push(
          `/**`,
          ` * (anything)`,
          ` */`,
          `\t${typeName}: function(value, _path) { return [] },`,
          ``
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
          TypeValidator.generateTypeValidator(itype, ctx),
          '\t\t'
        ),
        [ '\t\treturn errors;',
          '\t},', '' ]
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
    // While processing the types, the validator generators will populate
    // constants in the global constants table(s).
    //
    let globalTableFragments = Object.keys(ctx.constantTables)
      .reduce(function(lines, tableName) {
        let table = ctx.constantTables[tableName];
        if (Array.isArray(table)) {
          // Array of anonymous expressions
          return lines.concat(
            [ `var ${tableName} = [` ],
            GeneratorUtil.indentFragments( table ).map(function(line) {
              return `${line},`;
            }),
            [ `];` ]
          );
        } else {
          // Object of named expressions
          return lines.concat(
            [ `var ${tableName} = {` ],
            GeneratorUtil.indentFragments(
              Object.keys(table).map(function(key) {
                return `${key}: ${table[key]},`
              })
            ),
            [ `};`, '' ]
          );
        }
      }, []);

    //
    // Compose the individual fragments into the full module source
    //
    return [].concat(
      'module.exports = (function() {',
        RAMLErrorPayload,
        globalTableFragments,
        '',
        privateValidatorFragments,
        '',
        validatorFragments,
        '',
        'return Validators;',
      '})();'
    ).join('\n');
  }

};
