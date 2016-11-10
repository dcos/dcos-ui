import crypto from 'crypto';

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
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition to check
   * @returns {Boolean} Returns true if this type is an in-line definition
   */
  isInlineType(itype) {
    // So, a type that has no name, but is either an array or a value type
    // is considered an in-line definition, and has a dedicated specialisation
    return (itype.nameId() == null) &&
           (itype.isArray() || itype.isValueType());
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
   * Should generate a validator named `SomeTypeAsArray` instead of an anomyous
   * validator like inline.
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition to check
   * @returns {Boolean} Returns true if this type is an in-line array
   */
  isArrayOfType(itype) {
    return (itype.nameId() === '') && itype.isArray();
  },

  /**
   * Return a comment that describes this inline type
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
   * @returns {String} The comment to the specialised inline type
   */
  getInlineTypeComment(itype) {
    let facets = itype.getFixedFacets();
    let comment = 'This is an in-line specialisation of ' + this.getInlineTypeBase(itype)
      + '\n with the following constraints:\n\n';
    return comment + Object.keys(facets).map(function(name) {
      if (name === 'items') {
        return `- ${name}: ${this.getTypeName(facets[name].extras.nominal)}`;
      } else {
        return `- ${name}: ${facets[name]}`;
      }
    }, this).join('\n');
  },

  /**
   * Returns the base type of the given in-line type definition
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
   * @returns {String} The string name of the base type
   */
  getInlineTypeBase(itype) {
    let typeName = itype.nameId();
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
  getInlineTypeName(itype) {
    // Calculate the checksum of the facets
    let facets = itype.getFixedFacets();
    let facetKeys = Object.keys(facets).sort();
    let expr = facetKeys.reduce(function(expr, key) {
      return expr + '|' + key + '=' + facets[key];
    }, '');

    // Calculate unique name
    let typeName = this.getInlineTypeBase(itype);
    return 'inline' + typeName[0].toUpperCase() + typeName.substr(1) + '_' +
            crypto.createHash('md5').update(expr).digest('hex');
  },

  /**
   * The name of the in-line array type.
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
   * @returns {String} Returns a string with the name of the given type
   */
  getArrayOfTypeName(itype) {
    return this.getTypeName(itype.componentType()) + 'AsArray';
  },

  /**
   * This function tries to put a name on the given run-time RAML definition.
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
   * @returns {String} Returns a string with the name of the given type
   */
  getTypeName(itype) {

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
  getTypeGroup(itype) {
    if (this.isInlineType(itype)) {
      return 'PrivateValidators';
    } else {
      return 'Validators';
    }
  },

  /**
   * Return the reference to the given type
   */
  getTypeRef(itype) {
    return this.getTypeGroup(itype) + '.' + this.getTypeName(itype);
  },

  /**
   * This function walks up the type tree until it reaches a native type
   * and then returns it's type.
   *
   * @param {ITypeDefinition} itype - The runtime type of the RAML definition
   * @returns {ITypeDefinition|null} The builtin type or null if not found
   */
  getBuiltinType(itype) {
    if (itype.isBuiltIn()) {
      return itype;
    }

    return itype.allSuperTypes().find(function(type) {
      return type.isBuiltIn();
    });
  },

  /**
   * Return the name of a builtin type
   *
   * @param {ITypeDefinition} itype - The runtime type of a RAML definition
   * @returns {string|null} The builtin type name or null if not found
   */
  getBuiltinTypeName(itype) {
    let builtinType = this.getBuiltinType(itype);
    if (builtinType == null) {
      return null;
    }

    return builtinType.nameId();
  }

};
