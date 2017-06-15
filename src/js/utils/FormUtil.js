import React from "react";

import Util from "./Util";

// Will return false if key isn't something like 'ports[0].value'.
function isNotMultipleProp(key) {
  return !key.includes("[") || !key.includes("]");
}

function containsMultipleProp(prop, fieldColumn, id) {
  if (id) {
    return !!(fieldColumn &&
      fieldColumn.name &&
      fieldColumn.name.includes(`${prop}[${id}]`));
  }

  return !!(fieldColumn &&
    fieldColumn.name &&
    fieldColumn.name.startsWith(`${prop}[`) &&
    fieldColumn.name.includes("]"));
}

const FormUtil = {
  /**
   * Creates a field definition with correctly formatted name.
   *
   * @return {Array} definition the created definition.
   * @param {String} prop Property name for created definition.
   * @param {Number} id Number for the instance. ex: port[id].value
   * @param {Array} definition Definition to copy.
   * @param {Object} model Default values to fill in field.
   * @param {Number} index To add to make name unique (should reuse same index).
   */
  getMultipleFieldDefinition(prop, id, definition, model, index = 0) {
    return definition.map(function(definitionField) {
      definitionField = Util.deepCopy(definitionField);
      // Use index for key, so we can reuse same key for same field,
      // to not make react think it is a completely new field
      definitionField.key = `${prop}[${index}].${definitionField.name}`;
      definitionField.name = `${prop}[${id}].${definitionField.name}`;

      const propKey = FormUtil.getPropKey(definitionField.name);
      if (model && Object.prototype.hasOwnProperty.call(model, propKey)) {
        definitionField.value = model[propKey];
      }

      return definitionField;
    });
  },

  /**
   * Takes a model and turns all the multiple props (ports[0].key) into a
   * format that makes sense (ports: [{key: 'value'}])
   *
   * @return {Object} newModel the created model.
   * @param {Object} model Model to copy fields over from.
   */
  modelToCombinedProps(model) {
    const propValues = {};
    model = Object.assign({}, model);

    Object.keys(model).forEach(function(key) {
      if (isNotMultipleProp(key) || !FormUtil.getProp(key)) {
        return;
      }

      const multipleProperty = FormUtil.getProp(key);
      const instanceValue = model[key];
      delete model[key];
      const valueIndex = FormUtil.getPropIndex(key);
      const valueProperty = FormUtil.getPropKey(key);

      if (propValues[multipleProperty] == null) {
        propValues[multipleProperty] = [];
      }

      if (valueProperty) {
        if (typeof propValues[multipleProperty][valueIndex] === "object") {
          propValues[multipleProperty][valueIndex][
            valueProperty
          ] = instanceValue;
        } else if (propValues[multipleProperty][valueIndex] == null) {
          propValues[multipleProperty][valueIndex] = {
            [valueProperty]: instanceValue
          };
        }
      }
    });

    Object.keys(propValues).forEach(function(propValue) {
      propValues[propValue] = propValues[propValue].filter(function(item) {
        return item !== undefined;
      });
    });

    return Object.assign({}, model, propValues);
  },

  /**
   * Checks if a field definition is an instance of a duplicate. For example,
   * it checks if the field's name is something like 'ports[0].key'.
   *
   * @param {String} prop Property name for fields to replace.
   * @param {Object} field Field to check for match.
   * @param {Number} id Id to match field.
   * @return {Boolean} isFieldInstanceOfProp If the field is an instance.
   */
  isFieldInstanceOfProp(prop, field, id) {
    const isFieldArray = Array.isArray(field);
    const recursiveCheck = nestedField => {
      return this.isFieldInstanceOfProp(prop, nestedField, id);
    };

    return (
      (isFieldArray && field.some(recursiveCheck)) ||
      containsMultipleProp(prop, field, id)
    );
  },

  /**
   * Removes all props with an ID in a definition. For example, if you pass in
   * 'ports' and 2 as the prop and id, it will remove things with the names like
   * 'ports[2].key' and 'ports[2].value' from the definition.
   *
   * @param {Array} definition Definition to remove fields from.
   * @param {String} prop Property name for fields to replace.
   * @param {Number} id Id to match when removing fields.
   * @return {undefined}
   */
  removePropID(definition, prop, id) {
    const fieldsToRemove = [];
    definition.forEach(field => {
      if (this.isFieldInstanceOfProp(prop, field, id)) {
        fieldsToRemove.push(field);
      }
    });

    fieldsToRemove.forEach(function(field) {
      definition.splice(definition.indexOf(field), 1);
    });
  },

  /**
   * Ex: if key is 'variables[0].key', this method will return 'variables'.
   *
   * @param {String} key String to parse for prop.
   * @return {String} prop
   */
  getProp(key) {
    return key && key.split("[")[0];
  },

  /**
   * Ex: if key is 'variables[0].key', this method will return 0.
   *
   * @param {String} key String to parse for index.
   * @return {Number} index
   */
  getPropIndex(key) {
    if (key == null) {
      return null;
    }

    const value = key.split("[");

    return parseInt(value[1].split("]")[0], 10);
  },

  /**
   * Ex: if key is 'variables[0].key', this method will return 'key'.
   *
   * @param {String} key String to parse for prop key.
   * @return {String} prop key
   */
  getPropKey(key) {
    return key && key.split(".")[1];
  },

  /**
   * Applies a callback on all field definitions within a form definition.
   *
   * @param {Array|Object} definition Definition to iterate through.
   * @param {Function} callback Function that will receive the field definitions.
   */
  forEachDefinition(definition, callback) {
    // This means the field is an individual field. Here we just set the error
    // to false.
    if (FormUtil.isFieldDefinition(definition)) {
      callback(definition);

      return;
    }

    // If an array of definitions, then call on each individual field.
    if (Array.isArray(definition)) {
      definition.forEach(function(fieldDefinition) {
        FormUtil.forEachDefinition(fieldDefinition, callback);
      });

      return;
    }

    // If has a property called 'definition' and it is an array, call on each
    // individual field. This can happen for definitions from TabForms
    // (multiple definitions).
    if (
      Object.prototype.hasOwnProperty.call(definition, "definition") &&
      Array.isArray(definition.definition)
    ) {
      FormUtil.forEachDefinition(definition.definition, callback);

      return;
    }

    // This means we're at the root of a multiple definition.
    if (!React.isValidElement(definition)) {
      Object.values(definition).forEach(function(nestedDefinition) {
        const isNested = Object.prototype.hasOwnProperty.call(
          nestedDefinition,
          "definition"
        );
        if (isNested) {
          FormUtil.forEachDefinition(nestedDefinition.definition, callback);
        }
      });
    }
  },

  /**
   * Checks if object is a proper field definition for a Form.
   *
   * @param {Object} fieldDefinition Definition to check.
   * @return {Boolean} isFieldDefinition Whether it is a definition.
   */
  isFieldDefinition(fieldDefinition) {
    return (
      typeof fieldDefinition === "object" &&
      fieldDefinition != null &&
      Object.prototype.hasOwnProperty.call(fieldDefinition, "name") &&
      Object.prototype.hasOwnProperty.call(fieldDefinition, "fieldType")
    );
  }
};

module.exports = FormUtil;
