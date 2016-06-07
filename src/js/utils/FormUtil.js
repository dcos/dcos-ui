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
   * @return {Array} parentDefinition the modified definition.
   * @param {Object} options Object containing properties for
   * transformingDefinition. The following properties are:
   *
   * {String} prop Property to transform into multiple fields.
   * {Number} propID ID to assign to field. ex: port[propID].value
   * {Object} parentDefinition Definition to modify.
   * {Object} itemDefinition Definition to create instance from.
   * {Number} instancesIndex Index to remove and add at.
   * {Function} getRemoveButton Getter to return button at end of row.
   * {Function} getNewRowButton Getter to return button at end of definition.
   * {Array} startValues Values to default to.
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

    if (propID == null) {
      propID = Util.uniqueID(prop);
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
   * @return {Boolean} isFieldInstanceOfProp If the field is an instance.
   * @param {String} prop Property name for fields to replace.
   * @param {Number} id Id to match field.
   * @param {Object} field Field to check for match.
   */
  isFieldInstanceOfProp: function (prop, id, field) {
    let isFieldArray = Array.isArray(field);
    let recursiveCheck = this.isFieldInstanceOfProp.bind(this, prop, id);

    return (isFieldArray && field.some(recursiveCheck)) ||
      containsMultipleProp(prop, id, field);
  },

  /**
   * @return {undefined}
   * @param {Array} definition Definition to remove fields from.
   * @param {String} prop Property name for fields to replace.
   * @param {Number} id Id to match when removing fields.
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
