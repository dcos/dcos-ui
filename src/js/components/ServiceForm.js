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
  healthChecks: ['protocol', 'portType'],
  ports: ['discovery']
};

const FIELDS_TO_WATCH = ['networkType'];
// Map a field to the tab it's contained within.
// Mapping to a tab helps us nest the model correctly when merging back into
// the definition (so we can enable the filtering of fields).
const FIELD_TO_TABS = {
  networkType: 'networking',
  ports: 'networking'
};

class ServiceForm extends SchemaForm {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = Hooks.applyFilter('serviceFormStoreListeners', [
      {name: 'virtualNetworks', events: ['success']}
    ]);

    this.internalStorage_set({
      model: {}
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

  handleFormChange(model, eventObj) {
    let {eventType, fieldName} = eventObj;

    if (eventType === 'change') {
      let propKey = FormUtil.getPropKey(fieldName);
      let shouldUpdateDefinition = Object.keys(model).some(function (changeKey) {
        let tab = FormUtil.getProp(changeKey);

        return (tab in DUPLICABLE_FIELDS_TO_WATCH)
          && (DUPLICABLE_FIELDS_TO_WATCH[tab].includes(propKey))
          || FIELDS_TO_WATCH.includes(fieldName);
      });

      if (shouldUpdateDefinition) {
        let combinedModel = FormUtil.modelToCombinedProps(model);
        let nestedModel = this.internalStorage_get().model;

        Object.keys(combinedModel).forEach(function (key) {
          if (key in FIELD_TO_TABS) {
            // Create nested object within tab key
            if (!nestedModel[FIELD_TO_TABS[key]]) {
              nestedModel[FIELD_TO_TABS[key]] = {};
            }
            if (combinedModel[key] != null) {
              nestedModel[FIELD_TO_TABS[key]][key] = combinedModel[key];
            }

            return;
          }
          if (combinedModel[key] != null) {
            nestedModel[key] = combinedModel[key];
          }
        });
        this.internalStorage_set({model: nestedModel});

        SchemaFormUtil.mergeModelIntoDefinition(
          nestedModel,
          this.multipleDefinition,
          this.getRemoveRowButton
        );
      }

      this.updateDefinitions();
      this.forceUpdate();
    }

    Hooks.doAction('serviceFormChange', ...arguments);
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
  }

  onVirtualNetworksStoreSuccess() {
    this.updateDefinitions();
  }

  getNetworkingDescriptionDefinition({networking:model}) {
    return {
      name: 'ports-description',
      render: function () {
        let {ports} = FormUtil.modelToCombinedProps(model);

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
    let model = this.triggerTabFormSubmit();
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

    }
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
