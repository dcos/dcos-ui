import FacetValidators from './FacetValidators';

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
function getAdditionalPropertiesValue(itype, defaultValue=true) {

  // Locate the type adapter
  const typeAdapter = itype.getAdapters().find(function (adapter) {
    return adapter.constructor.name === 'InheritedType';
  });
  if (!typeAdapter) {
    return defaultValue;
  }

  // The metadata KnownPropertyRestriction is defined when the
  // additionalProperties facet is defined and it's value contains
  // the facet's value
  const knownProperty = typeAdapter.meta().find(function (meta) {
    return meta.constructor.name === 'KnownPropertyRestriction';
  });
  if (!knownProperty) {
    return defaultValue;
  }

  return knownProperty.value();
}

const HighOrderComposers = {

  /**
   * Compose a union validator
   *
   * @param {Object} facets - An object with all the facets in the type
   * @param {Array} unionValidatorFns - The names of the type validation
   *   functions taking place in the union.
   * @return {Array} - The union validator code lines
   */
  composeUnion(facets, unionValidatorFns) {
    const fragments = [].concat(
      'errors = errors.concat([',

      // Run the union validation type for every possible union type
      unionValidatorFns.map(function (typeValidatorFn) {
        return `\t${typeValidatorFn}(value, path),`;
      }),

      // Sort the validator responses by the number of errors, ascending
      '].sort(function(a, b) {',
      '\treturn a.length - b.length;',

      //
      // Pick the validation with the fewest possible errors
      //
      // If == 0 : The union type validation succeeded
      // If  > 0 : The union with the fewest errors, and therefore the most
      //           probable match.
      //
      '})[0]);'
    );

    return fragments;
  },

  /**
   * Compose a plain type, validated only by it's facets
   *
   * @param {Object} facets - An object with all the facets in the type
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  composeFacets(facets, context) {
    return FacetValidators.generateFacetFragments(facets, context);
  },

  /**
   * Compose object properties type validator
   *
   * @param {Array} properties - An array of IProperty instances
   * @param {ITypeDefinition} itype - The RAML type that has these properties
   * @param {GeneratorContext} context - The current generator context
   * @return {Array} - The type validator code lines
   */
  composeObjectProperties(properties, itype, context) {
    const REGEX_MATCHING_REGEX = /[\[\]\(\)\{\}\\\^\$\.\|\?\*\+/]/g;
    let hasPropsDefined = false;
    const stringMatchers = [];
    const regexMatchers = [];
    let fragments = [];

    // Pre-process properties and create regex and string-based matchers
    properties.forEach(function (prop) {
      const typeValidatorFn = context.uses(prop.range());
      const key = prop.nameId();
      let keyRegex = prop.getKeyRegexp();

      // FIX: When the key looks like a regex, other RAML generators consider
      //      it a valid regex. However `raml-1-parser` does not understands it,
      //      keeping the `keyRegex` undefined.
      if ((keyRegex == null) && REGEX_MATCHING_REGEX.exec(key)) {
        keyRegex = key;
        if ((key[0] === '/') && (key[key.length - 1] === '/')) {
          keyRegex = key.slice(1, -1);
        }
      }

      // Store on the appropriate list
      if (!keyRegex) {
        stringMatchers.push([key, prop.isRequired(), typeValidatorFn]);
      } else {
        let isRequired = false;

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
      fragments.push(
        'var matched = [];',
        'var props = Object.keys(value);'
      );

      // If we are mixing regex properties and regular ones, exclude regular
      // properties from being processed as regex
      const outliers = stringMatchers.map(function (match) {
        return match[0];
      });
      if (outliers.length) {
        fragments.push(
          'var regexProps = props.filter(function(key) {',
          `\treturn ${JSON.stringify(outliers)}.indexOf(key) === -1;`,
          '});'
        );
      } else {
        fragments.push(
          'var regexProps = props;'
        );
      }

      fragments = regexMatchers.reduce(function (fragments, [regex, required, validatorFn]) {
        const REGEX = context.getConstantExpression(
          'REGEX', `new RegExp('${regex.replace(/'/g, '\\\'')}')`
        );

        fragments.push(
          'matched = regexProps.filter(function(key) {',
          `\treturn ${REGEX}.exec(key);`,
          '});'
        );

        // Check for required props
        if (required) {
          context.useError('PROP_MISSING_MATCH');
          fragments.push(
            'if (matched.length === 0) {',
            `\terrors.push(new RAMLError(path, context, "PROP_MISSING_MATCH", {pattern: '${regex}'}));`,
            '}'
          );
        }

        // Validate property children
        return fragments.concat([
          'errors = matched.reduce(function(errors, property) {',
          `\treturn errors.concat(${validatorFn}(value[property], path.concat([property])));`,
          '}, errors);'
        ]);
      }, fragments);
    }

    // Process string-based properties
    if (stringMatchers.length !== 0) {
      fragments = stringMatchers.reduce(function (fragments, [name, required, validatorFn]) {
        if (required) {
          return fragments.concat(
            HighOrderComposers.composeRequiredProperty(
              name, validatorFn, context
            )
          );

        } else {
          return fragments.concat(
            HighOrderComposers.composeProperty(
              name, validatorFn, context
            )
          );

        }
      }, fragments);
    }

    // The `additionalProperties` facet is a bit more complicated, since it
    // requires traversal through it's keys
    if (getAdditionalPropertiesValue(itype) === false) {

      // Don't re-define props if we already have them
      if (!hasPropsDefined) {
        fragments.push(
          'var props = Object.keys(value);'
        );
      }

      context.useError('PROP_ADDITIONAL_PROPS');

      // Iterate over properties and check if the validators match
      fragments = fragments.concat(
        'props.forEach(function(key) {',
        stringMatchers.reduce(function (fragments, [name, _, __]) {
          return fragments.concat([
            `\tif (key === "${name}") return;`
          ]);
        }, []),
        regexMatchers.reduce(function (fragments, [regex, _, __]) {
          const REGEX = context.getConstantExpression(
            'REGEX', `new RegExp('${regex.replace(/'/g, '\\\'')}')`
          );

          return fragments.concat([
            `if (${REGEX}.exec(key)) return;`
          ]);
        }, []),
        '\terrors.push(new RAMLError(path, context, "PROP_ADDITIONAL_PROPS", {name: key}));',
        '});'
      );
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
  composeRequiredProperty(property, validatorFn, context) {
    let errorPath = 'path';
    let ERROR_TYPE;

    // If we are configured to show missing properties to their own path use
    // different error message and different error path.
    if (context.options.missingPropertiesOnTheirPath) {
      errorPath = `path.concat(['${property}'])`;
      ERROR_TYPE = 'PROP_IS_MISSING';
    } else {
      ERROR_TYPE = 'PROP_MISSING';
    }

    context.useError(ERROR_TYPE);

    return [
      `if (value.${property} == null) {`,
      `\terrors.push(new RAMLError(${errorPath}, context, "${ERROR_TYPE}", {name: '${property}'}));`,
      '} else {',
      `\terrors = errors.concat(${validatorFn}(value.${property}, path.concat(['${property}'])));`,
      '}'
    ];
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
  composeProperty(property, validatorFn, context) {
  /* eslint-enable no-unused-vars */
    return [
      `if (value.${property} != null) {`,
      `\terrors = errors.concat(${validatorFn}(value.${property}, path.concat(['${property}'])));`,
      '}'
    ];
  }

};

module.exports = HighOrderComposers;
