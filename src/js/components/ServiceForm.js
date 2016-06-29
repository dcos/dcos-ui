import {Hooks} from 'PluginSDK';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import SchemaForm from './SchemaForm';
import SchemaFormUtil from '../utils/SchemaFormUtil';
import SchemaUtil from '../utils/SchemaUtil';
import VirtualNetworksStore from '../stores/VirtualNetworksStore';

const METHODS_TO_BIND = [
  'handleFormChange',
  'onVirtualNetworksStoreSuccess',
  'validateForm'
];

const FIELDS_TO_WATCH = {
  healthChecks: ['protocol', 'portType']
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
    if (eventObj.eventType === 'change') {
      // Since the keys we're watching are of the
      // form `prop[id].key`, extract the key
      let propKey = FormUtil.getPropKey(eventObj.fieldName);

      let shouldUpdateDefinition = Object.keys(model).some(function (changeKey) {
        let tab = FormUtil.getProp(changeKey);

        return (tab in FIELDS_TO_WATCH)
          && (FIELDS_TO_WATCH[tab].includes(propKey));
      });

      if (shouldUpdateDefinition) {
        SchemaFormUtil.mergeModelIntoDefinition(
          FormUtil.modelToCombinedProps(model),
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

  updateDefinitions() {
    let {networking} = this.multipleDefinition;

    if (networking) {
      let {networkType} = this.props.schema.properties.networking.properties;

      let virtualNetworks = VirtualNetworksStore.getOverlays()
        .mapItems(function (overlay) {
          let name = overlay.getName();

          return {html: `Virtual Network: ${name}`, id: name}
        }).getItems();

      networking.definition.forEach(function (definition) {
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
