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

const FormUtil = {
  getMultipleFields: function (prop, count, definition) {
    let definitions = [];
    let multipleDefinition = Array.isArray(definition);

    for (let i = 0; i < count; i++) {
      let definitionInstance;
      if (multipleDefinition) {
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
      if (!key.includes('[') || !key.includes(']')) {
        return;
      }

      let value = key.split('[');
      if (value[0] !== prop) {
        return;
      }

      let instanceValue = model[key];
      delete model[key];
      let valueIndex = parseInt(value[1].split(']')[0]);
      let valueProperty = value[1].split('.')[1];

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

global.test = FormUtil.getMultipleFields;
global.xform = FormUtil.modelToCombinedProps;

module.exports = FormUtil;
