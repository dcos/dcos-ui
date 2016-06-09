import FormUtil from './FormUtil';
import Util from './Util';

function getValueFromSchemaProperty(fieldProps) {
  let value = '';

  if (fieldProps.default != null) {
    value = fieldProps.default;
    if (typeof value === 'number') {
      value = value.toString();
    }
  }

  if (Array.isArray(fieldProps.default) && fieldProps.default.length === 0) {
    value = '';
  }

  return value;
}

function getLabelFromSchemaProperty(fieldName, fieldProps, isRequired, renderLabel) {
  let label = fieldProps.title || fieldName;

  if (isRequired) {
    label = `${label} *`;
  }

  if (renderLabel && fieldProps.description) {
    return renderLabel(fieldProps.description, label);
  }

  return label;
}

function schemaToFieldDefinition(fieldName, fieldProps, formParent, isRequired, renderLabel, renderRemove) {
  let value = getValueFromSchemaProperty(fieldProps);
  let label = getLabelFromSchemaProperty(fieldName, fieldProps, isRequired, renderLabel);

  let definition = {
    fieldType: 'text',
    name: fieldName,
    placeholder: '',
    isRequired,
    required: false,
    showError: false,
    showLabel: label,
    writeType: 'input',
    validation: function () { return true; },
    value,
    valueType: fieldProps.type
  };

  if (typeof value === 'boolean') {
    definition.checked = value;
  }

  if (fieldProps.fieldType === 'select') {
    definition.fieldType = 'select';
    definition.options = fieldProps.options;
  }

  if (fieldProps.type === 'boolean') {
    definition.fieldType = 'checkbox';
    definition.checked = fieldProps.default || false;
  }

  if (fieldProps.multiLine === true) {
    definition.fieldType = 'textarea';
  }

  if (fieldProps.duplicable === true && fieldProps.itemShape) {
    let itemShape = nestedSchemaToFieldDefinition(
      fieldName,
      fieldProps.itemShape,
      formParent,
      renderLabel,
      renderLabel
    );
    let propID = Util.uniqueID(fieldName);

    definition = FormUtil.getMultipleFieldDefinition(
      fieldName,
      propID,
      itemShape.definition
    );

    if (renderRemove) {
      definition.push(renderRemove(formParent, fieldName, propID));
    }

    if (formParent.itemShapes == null) {
      formParent.itemShapes = {};
    }

    formParent.itemShapes[fieldName] = itemShape;

    return definition;
  }

  return definition;
}

function nestedSchemaToFieldDefinition(fieldName, fieldProps, topLevelProp, renderSubheader, renderLabel) {
  let nestedDefinition = {
    name: fieldName,
    render: null,
    fieldType: 'object',
    definition: []
  };

  if (typeof renderSubheader === 'function') {
    nestedDefinition.render = renderSubheader.bind(null, fieldName);
  }

  let properties = fieldProps.properties;
  let requiredProps = fieldProps.required;

  Object.keys(properties).forEach(function (nestedFieldName) {
    let nestedPropertyValue = properties[nestedFieldName];

    if (nestedPropertyValue.properties) {
      nestedDefinition.definition.push(
        nestedSchemaToFieldDefinition(
          nestedFieldName,
          nestedPropertyValue,
          nestedDefinition.definition,
          renderSubheader,
          renderLabel
        )
      );
    } else {
      nestedDefinition.definition.push(
        schemaToFieldDefinition(
          nestedFieldName,
          nestedPropertyValue,
          nestedDefinition.definition,
          requiredProps && requiredProps.indexOf(nestedFieldName) > -1,
          renderLabel
        )
      );
    }
  });

  return nestedDefinition;
}

let SchemaUtil = {
  schemaToMultipleDefinition: function (schema, renderSubheader, renderLabel, renderRemove, renderAdd) {
    let multipleDefinition = {};
    let schemaProperties = schema.properties;

    Object.keys(schemaProperties).forEach(function (topLevelProp) {
      let topLevelPropertyObject = schemaProperties[topLevelProp];
      let secondLevelProperties = topLevelPropertyObject.properties;
      let requiredProps = topLevelPropertyObject.required;
      let definitionForm = multipleDefinition[topLevelProp] = {};

      definitionForm.title = topLevelPropertyObject.title || topLevelProp;
      definitionForm.value = topLevelProp;
      definitionForm.description = topLevelPropertyObject.description;
      definitionForm.definition = [];
      Object.keys(secondLevelProperties).forEach(function (secondLevelProp) {
        let secondLevelObject = secondLevelProperties[secondLevelProp];
        let fieldDefinition;

        if (secondLevelObject.properties == null) {
          fieldDefinition = schemaToFieldDefinition(
            secondLevelProp,
            secondLevelObject,
            definitionForm.definition,
            requiredProps && requiredProps.indexOf(secondLevelProp) > -1,
            renderLabel,
            renderRemove,
            renderAdd
          );
        } else {
          fieldDefinition = nestedSchemaToFieldDefinition(
            secondLevelProp,
            secondLevelObject,
            definitionForm.definition,
            renderSubheader,
            renderLabel,
            renderRemove,
            renderAdd
          );
        }
        definitionForm.definition.push(fieldDefinition);

        if (secondLevelObject.duplicable === true && renderAdd) {
          let itemShape = nestedSchemaToFieldDefinition(
            secondLevelProp,
            secondLevelObject.itemShape,
            definitionForm.definition,
            renderLabel,
            renderLabel
          );

          definitionForm.definition.push(
            renderAdd(
              secondLevelProp,
              definitionForm.definition,
              itemShape.definition
            )
          );
        }
      });

    });

    return multipleDefinition;
  },

  definitionToJSONDocument: function (definition) {
    let jsonDocument = {};

    Object.keys(definition).forEach(function (topLevelProp) {
      let topLevelProperties = definition[topLevelProp];
      let topLevelDefinition = jsonDocument[topLevelProp] = {};
      let topLevelDefinitionValues = topLevelProperties.definition;

      if (!topLevelDefinitionValues) {
        return;
      }

      topLevelDefinitionValues.forEach(function (formDefinition) {
        if (formDefinition.definition) {
          let nested = topLevelDefinition[formDefinition.name] = {};
          formDefinition.definition.forEach(function (nestedDefinition) {
            let fieldName = nestedDefinition.name;
            let fieldValue = nestedDefinition.value;
            nested[fieldName] = fieldValue;
          });
        } else {
          let fieldName = formDefinition.name;
          let fieldValue = formDefinition.value;
          topLevelDefinition[fieldName] = fieldValue;
        }
      });
    });

    return jsonDocument;
  },

  validateSchema: function (schema) {
    try {
      SchemaUtil.definitionToJSONDocument(
        SchemaUtil.schemaToMultipleDefinition(schema)
      );
      return true;
    } catch (e) {
      return false;
    }
  }
};

module.exports = SchemaUtil;
