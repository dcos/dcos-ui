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

function setLabelFromSchemaProperty(fieldName, fieldProps, isRequired, renderLabel, definition) {
  let label = fieldProps.title || fieldName;

  if (isRequired) {
    label = `${label} *`;
  }

  if (renderLabel && fieldProps.description) {
    label = renderLabel(fieldProps.description, label, fieldProps.type);
  }

  // Set the label property of checkboxes if a label is defined.
  if (fieldProps.type === 'boolean') {
    definition.label = fieldProps.label || label;
    return;
  }

  definition.showLabel = label;
}

function schemaToFieldDefinition(options) {
  let {
    fieldName,
    fieldProps,
    formParent,
    isRequired,
    renderLabel,
    renderRemove
  } = options;
  let value = getValueFromSchemaProperty(fieldProps);

  let definition = {
    fieldType: 'text',
    focused: false,
    name: fieldName,
    placeholder: '',
    isRequired,
    required: false,
    showError: false,
    writeType: 'input',
    validation() { return true; },
    externalValidator: fieldProps.externalValidator,
    value,
    valueType: fieldProps.type
  };

  if (fieldProps.className != null) {
    definition.labelClass = fieldProps.className;
  }

  setLabelFromSchemaProperty(fieldName, fieldProps, isRequired, renderLabel, definition);

  if (typeof value === 'boolean') {
    definition.checked = value;
  }

  if (fieldProps.type === 'number') {
    definition.fieldType = 'number';
  }

  if (fieldProps.focused) {
    definition.focused = true;
  }

  if (fieldProps.fieldType === 'select') {
    definition.fieldType = 'select';
    definition.options = fieldProps.options;
  }

  if (fieldProps.helpBlock) {
    definition.helpBlock = fieldProps.helpBlock;
  }

  if (fieldProps.type === 'boolean') {
    definition.fieldType = 'checkbox';
    definition.checked = fieldProps.default || false;
  }

  if (fieldProps.multiLine === true) {
    definition.fieldType = 'textarea';
  }

  if (fieldProps.formElementClass) {
    definition.formElementClass = fieldProps.formElementClass;
  }

  if (fieldProps.inputClass) {
    definition.inputClass = fieldProps.inputClass;
  }

  if (fieldProps.filterProperties) {
    definition.filterProperties = fieldProps.filterProperties;
  }

  if (fieldProps.duplicable === true && fieldProps.itemShape) {
    let itemShape = nestedSchemaToFieldDefinition({
      fieldName,
      fieldProps: fieldProps.itemShape,
      renderSubheader: renderLabel,
      renderLabel,
      filterProperties: fieldProps.filterProperties
    });
    let propID = Util.uniqueID(fieldName);

    definition = FormUtil.getMultipleFieldDefinition(
      fieldName,
      propID,
      itemShape.definition
    );

    if (fieldProps.filterProperties) {
      itemShape.filterProperties = fieldProps.filterProperties;
    }

    if (fieldProps.getTitle) {
      itemShape.getTitle = fieldProps.getTitle;
    }

    if (renderRemove) {
      let arrayAction = 'push';
      if (fieldProps.deleteButtonTop) {
        itemShape.deleteButtonTop = true;
        arrayAction = 'unshift';
      }
      let title = null;
      if (itemShape.getTitle) {
        title = itemShape.getTitle();
      }

      definition[arrayAction](renderRemove(formParent, fieldName, propID, title));
    }

    if (formParent.itemShapes == null) {
      formParent.itemShapes = {};
    }

    formParent.itemShapes[fieldName] = itemShape;

    return definition;
  }

  return definition;
}

function nestedSchemaToFieldDefinition(options) {
  let {
    fieldName,
    fieldProps,
    renderSubheader,
    renderLabel,
    filterProperties,
    levelsDeep = 0
  } = options;
  let nestedDefinition = {
    name: fieldName,
    render: null,
    fieldType: 'object',
    definition: []
  };

  if (typeof renderSubheader === 'function') {
    nestedDefinition.render = renderSubheader.bind(null, fieldName, fieldProps.description, levelsDeep);
  }

  let properties = fieldProps.properties;
  let requiredProps = fieldProps.required;

  Object.keys(properties).forEach(function (nestedFieldName) {
    let nestedPropertyValue = properties[nestedFieldName];
    if (nestedPropertyValue.properties) {
      nestedDefinition.definition.push(
        nestedSchemaToFieldDefinition({
          fieldName: nestedFieldName,
          fieldProps: nestedPropertyValue,
          renderSubheader,
          renderLabel,
          filterProperties,
          levelsDeep: levelsDeep + 1
        })
      );
    } else {
      nestedDefinition.definition.push(
        schemaToFieldDefinition({
          fieldName: nestedFieldName,
          fieldProps: nestedPropertyValue,
          formParent: nestedDefinition.definition,
          isRequired: requiredProps && requiredProps.indexOf(nestedFieldName) > -1,
          renderLabel
        })
      );
    }
  });

  if (filterProperties) {
    filterProperties({}, nestedDefinition.definition);
  }

  return nestedDefinition;
}

let SchemaUtil = {
  /**
   * Turns a JSON Schema into a Form definition.
   *
   * @param {Object} options Object containing properties for transforming a
   * schema into a form definition. The following properties are:
   * {Object} schema Schema to transform.
   * {Function} renderSubheader Function used to render a subheader. We render subheaders for properties that are nested.
   * {Function} renderLabel Function used to render a label.
   * {Function} renderRemove Function used to render a remove button for duplicable rows.
   * {Function} renderAdd Function used to render an add button for duplicable rows.
   *
   * @return {Object} multipleDefinition The form definition.
   */
  schemaToMultipleDefinition(options) {
    let {
      schema,
      renderSubheader,
      renderLabel,
      renderRemove,
      renderAdd
    } = options;
    let multipleDefinition = {};
    let schemaProperties = schema.properties;

    Object.keys(schemaProperties).forEach(function (topLevelProp) {
      let topLevelPropertyObject = schemaProperties[topLevelProp];
      let secondLevelProperties = topLevelPropertyObject.properties;
      let requiredProps = topLevelPropertyObject.required;
      let definitionForm = multipleDefinition[topLevelProp] = {};

      definitionForm.title = topLevelPropertyObject.title || topLevelProp;
      definitionForm.selectValue = topLevelProp;
      definitionForm.description = topLevelPropertyObject.description;
      definitionForm.definition = [];
      Object.keys(secondLevelProperties).forEach(function (secondLevelProp) {
        let secondLevelObject = secondLevelProperties[secondLevelProp];
        let fieldDefinition;

        if (secondLevelObject.type === 'group' && secondLevelObject.properties != null) {
          fieldDefinition = Object.keys(secondLevelObject.properties).map(function (key) {
            let field = secondLevelObject.properties[key];

            return schemaToFieldDefinition({
              fieldName: key,
              fieldProps: field,
              formParent: topLevelProp,
              isRequired: requiredProps && requiredProps.indexOf(secondLevelProp) > -1,
              renderLabel
            });
          });
        } else if (secondLevelObject.properties == null) {
          fieldDefinition = schemaToFieldDefinition({
            fieldName: secondLevelProp,
            fieldProps: secondLevelObject,
            formParent: definitionForm.definition,
            isRequired: requiredProps && requiredProps.indexOf(secondLevelProp) > -1,
            renderLabel,
            renderRemove
          });
        } else {
          fieldDefinition = nestedSchemaToFieldDefinition({
            fieldName: secondLevelProp,
            fieldProps: secondLevelObject,
            renderSubheader,
            renderLabel,
            filterProperties: secondLevelObject.filterProperties
          });
        }

        if (secondLevelObject.duplicable === true) {
          let itemShape = nestedSchemaToFieldDefinition({
            fieldName: secondLevelProp,
            fieldProps: secondLevelObject.itemShape,
            renderLabel,
            renderLabel,
            filterProperties: secondLevelObject.filterProperties
          });

          if (secondLevelObject.title) {
            definitionForm.definition.push(
              renderSubheader(secondLevelObject.title, secondLevelObject.description)
            );
          }
          definitionForm.definition.push(fieldDefinition);

          if (renderAdd) {
            definitionForm.definition.push(
              {
                render: renderAdd.bind(
                  null,
                  secondLevelProp,
                  definitionForm.definition,
                  itemShape.definition,
                  secondLevelProperties[secondLevelProp].addLabel
                ),
                prop: secondLevelProp
              }
            );
          }

          return;
        }

        definitionForm.definition.push(fieldDefinition);
      });

    });

    return multipleDefinition;
  },

  /**
   * Turns a form definition into a model.
   *
   * @param {Object} definition Form definition to convert to model.
   *
   * @return {Object} multipleDefinition The form definition.
   */
  definitionToJSONDocument(definition) {
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

  /**
   * Checks to see if object is a valid JSON schema.
   *
   * @param {Object} schema Schema to validate.
   *
   * @return {Boolean} isValidSchema Whether the schema is valid.
   */
  validateSchema(schema) {
    try {
      SchemaUtil.definitionToJSONDocument(
        SchemaUtil.schemaToMultipleDefinition({schema})
      );
      return true;
    } catch (e) {
      return false;
    }
  }
};

module.exports = SchemaUtil;
