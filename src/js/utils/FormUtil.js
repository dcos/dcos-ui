function cloneDefinition(array) {
  return array.map(function (object) {
    if (Array.isArray(object)) {
      return object.slice();
    }

    if (typeof object === 'object') {
      return Object.assign({}, object);
    }

    return object;
  });
}

function getProp(key) {
  return key.split('[')[0];
}

function getPropIndex(key) {
  let value = key.split('[');
  return parseInt(value[1].split(']')[0])
}

function getPropKey(key) {
  let value = key.split('[');
  return value[1].split('.')[1];
}

function isNotMultipleProp(key) {
  return !key.includes('[') || !key.includes(']');
}

const FormUtil = {
  getMultipleFieldDefinitions: function (prop, count, definition) {
    let definitions = [];
    let isMultipleDefinition = Array.isArray(definition);

    for (let i = 0; i < count; i++) {
      let definitionInstance;
      if (isMultipleDefinition) {
        definitionInstance = cloneDefinition(definition).map(function (definitionClone) {
          definitionClone.name = `${prop}[${i}].${definitionClone.name}`;

          return definitionClone;
        });
      } else {
        definitionInstance = Object.assign({}, definition);
        definitionInstance.name = `${prop}[${i}]`;
      }

      definitions.push(definitionInstance);
    }

    return definitions;
  },

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

    return Object.assign({}, model, {[prop]: propValue});
  }
};

module.exports = FormUtil;
