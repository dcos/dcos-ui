import {Hooks} from 'PluginSDK';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';
import StringUtil from '../utils/StringUtil';
import VirtualNetworksStore from '../stores/VirtualNetworksStore';

const METHODS_TO_BIND = [
  'handleFormChange',
  'onVirtualNetworksStoreSuccess',
  'validateForm'
];

const DUPLICABLE_FIELDS_TO_WATCH = {
  healthChecks: {
    fields: ['protocol', 'portType'],
    forceUpdate: true
  },
  ports: {
    fields: ['discovery', 'protocol'],
    blurOnly: ['name'],
    forceUpdate: true
  }
};

const NESTED_FIELDS = [
  'dockerVolumes',
  'externalVolumes',
  'localVolumes',
  'networkType',
  'ports'
];

const FIELDS_TO_WATCH = {
  networkType: {
    forceUpdate: true
  },
  image: {
    forceUpdate: false
  }
};

class ServiceForm extends SchemaForm {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = Hooks.applyFilter('serviceFormStoreListeners', [
      {
        name: 'virtualNetworks',
        events: ['success'],
        suppressUpdate: true
      }
    ]);

    this.internalStorage_set({
      currentTab: 'general',
      model: {
        networking: {
          networkType: 'host'
        }
      }
    });
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    Hooks.doAction('serviceFormMount', this);
  }

  handleFormChange(changes, eventObj) {
    let {eventType, fieldName} = eventObj;
    let propKey = FormUtil.getPropKey(fieldName);
    let blurChange = Object.values(DUPLICABLE_FIELDS_TO_WATCH).some(function (item) {
      return item.blurOnly && item.blurOnly.includes(propKey);
    });
    if (eventType === 'change' || (eventType === 'blur' && blurChange)) {

      let shouldUpdateDefinition = Object.keys(changes).some(function (changeKey) {
        let tab = FormUtil.getProp(changeKey);

        return (tab in DUPLICABLE_FIELDS_TO_WATCH)
          && (DUPLICABLE_FIELDS_TO_WATCH[tab].fields.includes(propKey)
          && DUPLICABLE_FIELDS_TO_WATCH[tab].forceUpdate)
          || (fieldName in FIELDS_TO_WATCH
          && FIELDS_TO_WATCH[fieldName].forceUpdate);
      }) || (eventType === 'blur' && blurChange);

      let {currentTab, model} = this.internalStorage_get();
      let combinedModel = FormUtil.modelToCombinedProps(changes);

      Object.keys(combinedModel).forEach(function (key) {
        if (!propKey || NESTED_FIELDS.includes(key)) {
          // Create nested object within tab key
          if (!model[currentTab]) {
            model[currentTab] = {};
          }
          if (combinedModel[key] != null) {
            if (!(key === 'networkType' && fieldName !== 'networkType')) {
              model[currentTab][key] = combinedModel[key];
            }
          }

          return;
        }
        if (combinedModel[key] != null) {
          if (!(key === 'networkType' && fieldName !== 'networkType')) {
            model[key] = combinedModel[key];
          }
        }
      });

      this.internalStorage_set({model, currentTab});

      if (shouldUpdateDefinition) {
        SchemaFormUtil.mergeModelIntoDefinition(
          model,
          this.multipleDefinition,
          this.getRemoveRowButton
        );

        this.updateDefinitions();
        this.forceUpdate();
      }
    }

    Hooks.doAction('serviceFormChange', ...arguments);
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
  }

  onVirtualNetworksStoreSuccess() {
    this.updateDefinitions();
  }

  getNetworkingDescriptionDefinition({networking: model}) {
    return {
      name: 'ports-description',
      render: function () {
        let {ports} = model;

        if (ports == null) {
          return null;
        }

        let portMapping = ports.map(function (port, index) {
          return `$PORT${index}`;
        });

        return (
          <div key="ports-description" style={{marginBottom: '20px'}}>
            Host ports will be dynamically assigned and mapped
            to {StringUtil.humanizeArray(portMapping)}.
          </div>
        );
      }
    }
  }

  updateDefinitions() {
    let {model} = this.internalStorage_get();
    let {networking} = this.multipleDefinition;

    if (networking) {
      let {networkType} = this.props.schema.properties.networking.properties;

      let virtualNetworks = VirtualNetworksStore.getOverlays()
        .mapItems(function (overlay) {
          let name = overlay.getName();

          return {html: `Virtual Network: ${name}`, id: name}
        }).getItems();

      let networkDescriptionDefinition =
        this.getNetworkingDescriptionDefinition(model);

      networking.definition.forEach(function (definition) {

        if (definition.name === networkDescriptionDefinition.name) {
          Object.assign(definition, networkDescriptionDefinition);
        }

        if (definition.name === 'networkType') {
          definition.options = [].concat(networkType.options, virtualNetworks);
        }

      });

      let definition = networking.definition;
      let firstCheckboxIndex = -1;

      for (let i = definition.length - 1; i >= 0; i--) {
        let currentDefinition = definition[i];
        if ((FormUtil.isFieldInstanceOfProp('ports', currentDefinition)
          && FormUtil.getPropKey(currentDefinition.name) === 'bananas')
          || currentDefinition.name === 'expose-endpoints') {

          firstCheckboxIndex = i;
        }
      }

      let checkboxes = this.getExposeNetworkingCheckboxes();
      let label = {
        name: 'expose-endpoints',
        render: function () {
          return <label key="expose-endpoints">Expose endpoints on physical network</label>;
        }
      };

      if (firstCheckboxIndex !== -1) {
        definition.splice(firstCheckboxIndex);
      }

      if (checkboxes.length) {
        definition.push(label, ...checkboxes);
      }

    }
  }

  handleTabClick(currentTab) {
    let {model} = this.internalStorage_get();
    this.internalStorage_set({currentTab, model});

    SchemaFormUtil.mergeModelIntoDefinition(
      model,
      this.multipleDefinition,
      this.getRemoveRowButton
    );

    this.updateDefinitions();
    this.forceUpdate();
  }

  getExposeNetworkingCheckboxes() {
    let {model} = this.internalStorage_get();
    let definitionGroup = [];
    let networkType = (model.networking.networkType || 'host').toLowerCase();
    let isUserMode = model.networking
      && !['host', 'bridge'].includes(networkType);
    let networkingDefinition = this.multipleDefinition.networking.definition;
    // First port definition in networking definition is at index 2
    let portDefinitionIndex = 2;

    if (model.networking && model.networking.ports && isUserMode) {
      model.networking.ports.forEach(function (port) {
        let portDefinition = networkingDefinition[portDefinitionIndex++];
        let propID = FormUtil.getPropIndex(portDefinition[0].name);

        if (port.name != null && port.name.length) {
          definitionGroup.push({
            fieldType: 'checkbox',
            name: `ports[${propID}].bananas`,
            placeholder: '',
            required: false,
            showError: false,
            writeType: 'input',
            value: port.bananas || false,
            valueType: 'boolean',
            label: `${port.name} (${port.lbPort || 0}/${port.protocol})`,
            checked: false
          });
        }
      });
    }

    return definitionGroup;
  }

  getNewDefinition() {
    let {model, schema} = this.props;

    schema = Hooks.applyFilter('serviceFormSchema', schema);

    let definition = SchemaUtil.schemaToMultipleDefinition(
      schema,
      this.getSubHeader,
      this.getLabel,
      this.getRemoveRowButton,
      this.getAddNewRowButton
    );

    SchemaFormUtil.mergeModelIntoDefinition(
      model,
      definition,
      this.getRemoveRowButton
    );

    // Append definitions
    let {networking} = definition;
    if (networking) {
      networking.definition.push(
        this.getNetworkingDescriptionDefinition(model)
      );
    }

    if (model) {
      this.internalStorage_set({model});
    }

    return definition;
  }

  validateForm() {
    this.model = this.triggerTabFormSubmit();
    // Handle the form change in the way service needs here.
    this.isValidated = true;

    return true;
  }
}

ServiceForm.defaultProps = {
  className: 'multiple-form row',
  getTriggerSubmit: function () {},
  onChange: function () {},
  schema: {}
};

ServiceForm.propTypes = {
  className: React.PropTypes.string,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  schema: React.PropTypes.object
};

module.exports = ServiceForm;
