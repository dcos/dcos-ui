import FacetValidators from './FacetValidators';
import { indentFragments } from '../utils/GeneratorUtil';

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
  let typeAdapter = itype.getAdapters().find(function(adapter) {
    return adapter.constructor.name === 'InheritedType';
  });
  if (!typeAdapter) {
    return defaultValue;
  }

  // The metadata KnownPropertyRestriction is defined when the
  // additionalProperties facet is defiend and it's value contains
  // the facet's value
  let knownProperty = typeAdapter.meta().find(function(meta) {
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
   */
  composeUnion(facets, unionValidatorFns, context) {
    let fragments = [].concat(
      `errors = errors.concat([`,

      // Run the union validation type for every possible union type
      unionValidatorFns.map(function(typeValidatorFn) {
        return `\t${typeValidatorFn}(value, path),`
      }),

      // Sort the validator responses by the number of errors, ascending
      `].sort(function(a, b) {`,
      `\treturn a.length - b.length;`,

      //
      // Pick the validation with the fewest possible errors
      //
      // If == 0 : The union type validation succeeded
      // If  > 0 : The union with the fewest errors, and therfore the most
      //           probabel match.
      //
      `})[0]);`
    );

    return fragments;
  },

  /**
   * Compose a plain type, only by it's facets
   */
  composeFacets(facets, context) {
    return FacetValidators.generateFacetFragments(facets, context);
  },

  /**
   * Compose object properties fragments
   */
  composeObjectProperties(properties, itype, context) {
    const REGEX_MATCHING_REGEX = /[\[\]\(\)\{\}\\\^\$\.\|\?\*\+/]/g;
    let hasPropsDefined = false;
    let stringMatchers = [];
    let regexMatchers = [];
    let fragments = [];

    // Pre-process properties and create regex and string-based matchers
    properties.forEach(function(prop) {
      let typeValidatorFn = context.uses(prop.range());
      let key = prop.nameId();
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
        `var matched = [];`,
        `var props = Object.keys(value);`
      );

      // If we are mixing regex properties and regular ones, exclude regular
      // properties from being processed as regex
      let outliers = stringMatchers.map(function(match) {
        return match[0];
      });
      if (outliers.length) {
        fragments.push(
          `var regexProps = props.filter(function(key) {`,
          `\treturn ${JSON.stringify(outliers)}.indexOf(key) === -1;`,
          `});`
        );
      } else {
        fragments.push(
          `var regexProps = props;`
        );
      }

      fragments = regexMatchers.reduce(function(fragments, [regex, required, validatorFn]) {
        let REGEX = context.getConstantExpression('REGEX', `/${regex}/`);
        let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
          'PROP_MISSING_MATCH', 'Missing a property that matches `{name}`');

        fragments.push(
          `matched = regexProps.filter(function(key) {`,
          `\treturn ${REGEX}.exec(key);`,
          `});`
        );

        // Check for required props
        if (required) {
          fragments.push(
            `if (matched.length === 0) {`,
            `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}, {name: '${regex}'}));`,
            `}`
          );
        }

        // Validate property children
        return fragments.concat([
          `errors = matched.reduce(function(errors, property) {`,
          `\treturn errors.concat(${validatorFn}(value[property], path.concat([property])));`,
          `}, errors);`
        ]);
      }, fragments);
    }

    // Process string-based properties
    if (stringMatchers.length !== 0) {
      fragments = stringMatchers.reduce(function(fragments, [name, required, validatorFn]) {
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
    // requires traversal thorugh it's keys
    if (getAdditionalPropertiesValue(itype) === false) {
      let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
        'PROP_ADDITIONAL_PROPS', 'Unexpected extraneous property `{name}`');

      // Don't re-define props if we already have them
      if (!hasPropsDefined) {
        fragments.push(
          `var props = Object.keys(value);`
        );
      }

      // Iterate over properties and check if the validators match
      fragments = fragments.concat(
        `props.forEach(function(key) {`,
        stringMatchers.reduce(function(fragments, [name, unused1, unused2]) {
          return fragments.concat([
            `\tif (key === "${name}") return;`
          ]);
        }, []),
        regexMatchers.reduce(function(fragments, [regex, unused1, unused2]) {
          let REGEX = context.getConstantExpression('REGEX', `/${regex}/`);
          return fragments.concat([
            `if (${REGEX}.exec(key)) return;`
          ]);
        }, []),
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}, {name: key}));`,
        `});`
      );
    }


    return fragments;
  },

  /**
   * Compose a required property framgent
   */
  composeRequiredProperty(property, validatorFn, context) {
    let ERROR_MESSAGE = context.getConstantString('ERROR_MESSAGES',
      'PROP_MISSING', 'Missing property `{name}`');

    return [
      `if (value.${property} == null) {`,
        `\terrors.push(new RAMLError(path, ${ERROR_MESSAGE}, {name: '${property}'}));`,
      `} else {`,
        `\terrors = errors.concat(${validatorFn}(value.${property}, path.concat(['${property}'])));`,
      `}`
    ];
  },

  /**
   * Compose a property framgent
   */
  composeProperty(property, validatorFn, context) {
    return [
      `if (value.${property} != null) {`,
        `\terrors = errors.concat(${validatorFn}(value.${property}, path.concat(['${property}'])));`,
      `}`
    ];
  }

};

module.exports = HighOrderComposers;
