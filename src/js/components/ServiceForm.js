import {Hooks} from 'PluginSDK';
import React from 'react';

import FormUtil from '../utils/FormUtil';
import HostUtil from '../utils/HostUtil';
import Icon from './Icon';
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
    blurOnly: ['name', 'lbPort'],
    forceUpdate: true
  }
};

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
    super(...arguments);

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
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();
    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    Hooks.doAction('serviceFormMount', this);
    // Update definition and build model
    this.updateDefinitions();
    this.bananas(true, 0);
  }

  onVirtualNetworksStoreSuccess() {
    this.updateDefinitions();
  }

  shouldUpdateDefinition(changes, eventType, fieldName) {
    let propKey = FormUtil.getPropKey(fieldName);
    let blurChange = Object.values(DUPLICABLE_FIELDS_TO_WATCH).some(function (item) {
      return item.blurOnly && item.blurOnly.includes(propKey);
    });

    return Object.keys(changes).some(function (changeKey) {
      let tab = FormUtil.getProp(changeKey);

      return (tab in DUPLICABLE_FIELDS_TO_WATCH)
        && (DUPLICABLE_FIELDS_TO_WATCH[tab].fields.includes(propKey)
        && DUPLICABLE_FIELDS_TO_WATCH[tab].forceUpdate)
        || (fieldName in FIELDS_TO_WATCH
        && FIELDS_TO_WATCH[fieldName].forceUpdate);

    }) || (eventType === 'blur' && blurChange);
  }

  handleFormChange(changes, eventObj) {
    let {eventType, fieldName} = eventObj;
    let shouldUpdateDefinition = this.shouldUpdateDefinition(
      changes, eventType, fieldName
    );

    if (eventType === 'change' || shouldUpdateDefinition) {
      this.bananas(shouldUpdateDefinition);
    }

    Hooks.doAction('serviceFormChange', ...arguments);
    // Handle the form change in the way service needs here.
    this.props.onChange(...arguments);
  }

  onVirtualNetworksStoreSuccess() {
    this.updateDefinitions();
  }

  getNetworkingDescriptionDefinition(model) {
    return {
      name: 'ports-description',
      render: () => {
        let {networkType} = this.getNetworkingConfiguration(model);
        let hostNetworkingDefinition = null;
        let {ports} = model.networking;
        let serviceAddressNetworkingDefinition = null;

        if (ports == null) {
          return null;
        }

        // Build out the Host ports that get dynamically created
        if ('host' === networkType) {
          let portMapping = ports.map(function (port, index) {
            return `$PORT${index}`;
          });
          portMapping = StringUtil.humanizeArray(portMapping, {
            wrapValueFunction: function (value, index) {
              return (
                <strong key={index}>{value}</strong>
              );
            }
          });

          hostNetworkingDefinition = (
            <p>
              Host ports will be dynamically assigned and mapped
              to {portMapping}.
            </p>
          );
        }

        // Build out the hostname mappings
        let serviceAddress = HostUtil.stringToHostname(model.general.id);
        if (serviceAddress) {
          serviceAddress += '.marathon.l4lb.thisdcos.directory';

          let addresses = ports.filter(function (port) {
            return !!port.lbPort;
          }).map(function (port, index) {
            return (
              <li key={index}>
                <strong>
                  {`${serviceAddress}:${port.lbPort}`}
                </strong>
              </li>
            );
          });

          serviceAddressNetworkingDefinition = (
            <div>
              <p>
                Clients can access your service at these Service Addresses
              </p>
              <ul className="list list-narrow">
                {addresses}
              </ul>
            </div>
          );
        }

        if (hostNetworkingDefinition == null &&
          serviceAddressNetworkingDefinition == null) {
          return null;
        }

        return (
          <div
            className="media-object-spacing-wrapper media-object-spacing-super-narrow"
            key="ports-description"
            style={{marginBottom: '20px'}}>
            <div className="media-object">
              <div className="media-object-item">
                <Icon
                  color="blue"
                  family="small"
                  id="ring-information"
                  size="mini" />
              </div>
              <div className="media-object-item media-object-item-shrink">
                {hostNetworkingDefinition}
                {serviceAddressNetworkingDefinition}
              </div>
            </div>
          </div>
        );
      }
    };
  }

  updateDefinitions() {
    let {model} = this.internalStorage_get();
    let {networking} = this.multipleDefinition;

    if (networking) {
      let {networkType} = this.props.schema.properties.networking.properties;

      let virtualNetworks = VirtualNetworksStore.getOverlays()
        .mapItems(function (overlay) {
          let name = overlay.getName();

          return {html: `Virtual Network: ${name}`, id: name};
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
          && FormUtil.getPropKey(currentDefinition.name) === 'expose')
          || currentDefinition.name === 'expose-endpoints') {

          firstCheckboxIndex = i;
        }
      }

      let checkboxes = this.getExposeNetworkingCheckboxes();
      let label = {
        name: 'expose-endpoints',
        render: function () {
          return <label key="expose-endpoints">Expose endpoints on host network</label>;
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

  handleTabClick() {
    this.bananas(true, 0);
  }

  handleAddRow() {
    super.handleAddRow(...arguments);
    this.bananas(true, 0);
  }

  handleRemoveRow() {
    super.handleRemoveRow(...arguments);
    this.bananas(true, 0);
  }

  bananas(shouldUpdateDefinition = false, delay = 50) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    // Debounce definition update. Also ensures we build the model with
    // latest form changes.
    this.timer = setTimeout(() => {
      let model = {};
      let formModel = this.triggerTabFormSubmit();

      Object.keys(formModel).forEach(function (key) {
        model[key] = FormUtil.modelToCombinedProps(formModel[key]);
      });

      model.environmentVariables = model.environmentVariables.environmentVariables;
      model.labels = model.labels.labels;
      model.healthChecks = model.healthChecks.healthChecks;

      if (!['host', 'bridge'].includes(model.networking.networkType)) {
        // Set expose to true as default
        model.networking.ports.map(function (port) {
          port.expose = port.expose || false;

          return port;
        });
      }
      this.internalStorage_set({model});

      if (shouldUpdateDefinition) {
        SchemaFormUtil.mergeModelIntoDefinition(
          model,
          this.multipleDefinition,
          this.getRemoveRowButton
        );

        this.updateDefinitions();
        this.forceUpdate();
      }
    }, delay);
  }

  getNetworkingConfiguration(model) {
    let networkType = (model.networking.networkType || 'host').toLowerCase();
    let isUserMode = model.networking
      && !['host', 'bridge'].includes(networkType);
    return {networkType, isUserMode};
  }

  getExposeNetworkingCheckboxes() {
    let {model} = this.internalStorage_get();
    let definitionGroup = [];
    let {isUserMode} = this.getNetworkingConfiguration(model);
    let networkingDefinition = this.multipleDefinition.networking.definition;
    // First port definition in networking definition is at index 2
    let portDefinitionIndex = 2;

    // TODO: We need to refactor this as the current impl. is highly error prone
    // -> Use the port name to map fields (it's required to be unique)
    if (model.networking && model.networking.ports && isUserMode) {
      model.networking.ports.forEach(function (port) {
        let portDefinition = networkingDefinition[portDefinitionIndex++];

        if (!Array.isArray(portDefinition)) {
          return;
        }

        let propID = FormUtil.getPropIndex(portDefinition[0].name);

        definitionGroup.push({
          fieldType: 'checkbox',
          name: `ports[${propID}].expose`,
          placeholder: '',
          required: false,
          showError: false,
          writeType: 'input',
          value: port.expose || false,
          valueType: 'boolean',
          label: `${port.name} (${port.lbPort || 0}/${port.protocol})`,
          checked: false
        });

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
