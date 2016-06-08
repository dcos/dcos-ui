import Util from './Util';

function getProp(key) {
  return key.split('[')[0];
}

function getPropIndex(key) {
  let value = key.split('[');
  return parseInt(value[1].split(']')[0])
}

function getPropKey(key) {
  return key.split('.')[1];
}

// Will return false if key isn't something like 'ports[0].value'.
function isNotMultipleProp(key) {
  return !key.includes('[') || !key.includes(']');
}

function containsMultipleProp(prop, id, fieldColumn) {
  return !!(
    fieldColumn &&
    fieldColumn.name &&
    fieldColumn.name.includes(`${prop}[${id}]`)
  );
}

function getNewDefinition(prop, propID, parentDefinition, itemDefinition, getRemoveButton, model) {
  let newDefinition = FormUtil.getMultipleFieldDefinition(
    prop,
    propID,
    itemDefinition,
    model
  );

  // Add remove button.
  if (getRemoveButton) {
    newDefinition.push(
      getRemoveButton(parentDefinition, prop, propID)
    );
  }

  return newDefinition;
}

const FormUtil = {
  /**
   * Modifies a form definition by replacing field properties that should be
   * duplicated with the correct number of fields.
   *
   * @param {Object} options Object containing properties for
   * transformingDefinition. The following properties are:
   * {String} prop Property to transform into multiple fields.
   * {Number} propID ID to assign to field. ex: port[propID].value
   * {Object} parentDefinition Definition to modify.
   * {Object} itemDefinition Definition to create instance from.
   * {Number} instancesIndex Index to remove and add at.
   * {Function} getRemoveButton Getter to return button at end of row.
   * {Function} getNewRowButton Getter to return button at end of definition.
   * {Array} startValues Values to default to.
   *
   * @return {Array} parentDefinition the modified definition.
   */
  transformDefinition: function (options) {
    let {
      prop,
      propID,
      parentDefinition,
      itemDefinition,
      instancesIndex,
      getRemoveButton,
      getNewRowButton,
      startValues
    } = options;

    if (prop == null || parentDefinition == null || itemDefinition == null) {
      throw 'Need prop, parent definition, and item definition to transform.'
    }

    if (instancesIndex == null) {
      instancesIndex = 0;
    }

    let newDefinition = [];
    if (startValues && startValues.length) {
      newDefinition = startValues.map(function (startValue) {
        return getNewDefinition(
          prop,
          Util.uniqueID(prop),
          parentDefinition,
          itemDefinition,
          getRemoveButton,
          startValue
        );
      });
    } else {
      if (propID == null) {
        propID = Util.uniqueID(prop);
      }

      newDefinition = [getNewDefinition(
        prop,
        propID,
        parentDefinition,
        itemDefinition,
        getRemoveButton
      )];
    }

    // Replace original definition with instance.
    parentDefinition.splice(instancesIndex, 1, ...newDefinition);

    // Add new row button.
    if (getNewRowButton) {
      parentDefinition.push(
        getNewRowButton(prop, parentDefinition, itemDefinition)
      );
    }

    return parentDefinition;
  },

  /**
   * Creates a field definition with correctly formatted name.
   *
   * @return {Array} definition the created definition.
   * @param {String} prop Property name for created definition.
   * @param {Number} id Number for the instance. ex: port[id].value
   * @param {Array} definition Definition to copy.
   * @param {Object} model Default values to fill in field.
   */
  getMultipleFieldDefinition: function (prop, id, definition, model) {
    return definition.map(function (definitionField) {
      definitionField = Util.deepCopy(definitionField);
      definitionField.name = `${prop}[${id}].${definitionField.name}`;

      let propKey = getPropKey(definitionField.name);
      if (model && model.hasOwnProperty(propKey)) {
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
   * @param {String} prop Property name for fields to replace.
   * @param {Object} model Model to copy fields over from.
   */
  modelToCombinedProps: function (prop, model) {
    let propValue = [];
    model = Object.assign({}, model);

    Object.keys(model).forEach(function (key) {
      if (isNotMultipleProp(key) || (getProp(key) !== prop)) {
        return;
      }

      let instanceValue = model[key];
      delete model[key];
      let valueIndex = getPropIndex(key);
      let valueProperty = getPropKey(key);

      if (valueProperty) {
        if (typeof propValue[valueIndex] === 'object') {
          propValue[valueIndex][valueProperty] = instanceValue;
        } else if (propValue[valueIndex] == null) {
          propValue[valueIndex] = {[valueProperty]: instanceValue};
        }
      } else {
        propValue[valueIndex] = instanceValue;
      }
    });

    propValue = propValue.filter(function (item) { return item !== undefined});
    return Object.assign({}, model, {[prop]: propValue});
  },

  /**
   * Checks if a field definition is an instance of a duplicate. For example,
   * it checks if the field's name is something like 'ports[0].key'.
   *
   * @param {String} prop Property name for fields to replace.
   * @param {Number} id Id to match field.
   * @param {Object} field Field to check for match.
   * @return {Boolean} isFieldInstanceOfProp If the field is an instance.
   */
  isFieldInstanceOfProp: function (prop, id, field) {
    let isFieldArray = Array.isArray(field);
    let recursiveCheck = this.isFieldInstanceOfProp.bind(this, prop, id);

    return (isFieldArray && field.some(recursiveCheck)) ||
      containsMultipleProp(prop, id, field);
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
  removePropID: function (definition, prop, id) {
    let fieldsToRemove = [];
    definition.forEach((field) => {
      if (this.isFieldInstanceOfProp(prop, id, field)) {
        fieldsToRemove.push(field);
      }
    });

    fieldsToRemove.forEach(function (field) {
      definition.splice(definition.indexOf(field), 1);
    });
  }
};

module.exports = FormUtil;
